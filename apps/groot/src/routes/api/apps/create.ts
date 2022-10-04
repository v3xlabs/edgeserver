import { Application } from "@edgelabs/types";
import { Static, Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { getCache } from "../../../cache";
import { DB } from "../../../database";
import { useAuth } from "../../../util/http/useAuth";
import { log } from "../../../util/logging";
import { KeyPerms, usePerms } from "../../../util/permissions";
import { generateSnowflake } from ".";

export const AppCreateRoute: FastifyPluginAsync = async (router, _options) => {
    const createPayload = Type.Object({
        name: Type.String(),
        domains: Type.Array(
            Type.Object({
                type: Type.Union([Type.Literal("ens"), Type.Literal("dns")]),
                name: Type.String(),
            }),
        ),
    });

    router.post<{
        Body: Static<typeof createPayload>;
    }>(
        "/",
        {
            schema: {
                body: createPayload,
            },
        },
        async (_request, reply) => {
            const { user_id, permissions, address } = await useAuth(
                _request,
                reply,
                { getAddress: true },
            );

            if (!address) throw new Error("No Address Found");

            usePerms(permissions, [KeyPerms.APPS_WRITE]);

            const { name, domains } = _request.body;

            log.debug({ n: _request.body });

            const oldAppId = await DB.selectOneFrom(
                "applications",
                ["app_id"],
                { name, owner_id: user_id },
            );

            if (oldAppId) {
                reply.status(409);
                reply.send({
                    error: "Application already exists",
                });

                return;
            }

            const createdProject: Partial<Application> = {
                app_id: BigInt(generateSnowflake()),
                owner_id: user_id,
                name,
                last_deployed: new Date().toString(),
            };
            // const domain: Partial<DomainV1> = {
            //     domain_id,
            //     domain: deployment,
            //     user_id: authData,
            // };

            await DB.insertInto("applications", createdProject);

            // await DB.insertInto('domains', domain);
            const redis = await getCache();

            for (const domain of domains) {
                if (domain.type == "dns") {
                    log.debug("dns verifying " + domain.name);
                    await redis.sAdd("dns:users:" + address, domain.name);
                    await redis.sAdd("dns:domains:" + domain.name, address);
                    await redis.lPush("dns:iqueue", domain.name);
                } else {
                    // TODO: Insert ENS Queueing here
                }
            }

            reply.send({ site_id: createdProject.app_id });
        },
    );
};
