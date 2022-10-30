import { FastifyPluginAsync } from "fastify";
import { generateSunflake } from "sunflake";

import { getCache } from "../../../cache";
import { useAuth } from "../../../util/http/useAuth";
import { KeyPerms, usePerms } from "../../../util/permissions";
import { UnverifiedDomain } from "@edgelabs/types";

export const generateSnowflake = generateSunflake();

// Fetches a list of unverified domains
export const DomainsUlsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get("/", async (_request, reply) => {
        const { user_id, permissions, address } = await useAuth(
            _request,
            reply,
            { getAddress: true },
        );

        usePerms(permissions, [KeyPerms.DOMAINS_READ]);

        const cache = await getCache();

        const unverified_domains = await cache.sMembers("dns:users:" + address);

        const unverified_rich_domains = unverified_domains.map((v) => {
            return { name: v, next_check: "0" } as UnverifiedDomain;
        });

        reply.send(unverified_rich_domains);
    });
};
