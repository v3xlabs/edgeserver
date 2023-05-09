import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../database/index.js';
import { TokenRoute } from '../tokens/index.js';
import { SitesRoute } from './sites.js';

export type TeamParameters = {
    Params: {
        team_id: string;
    };
};

export const TeamRoute: FastifyPluginAsync = async (router) => {
    router.get('/', GetTeamRoute);
    router.get('/sites', SitesRoute);
    router.register(TokenRoute, { prefix: '/tokens' });
};

const GetTeamRoute = async (request, reply) => {
    const { team_id } = request.params as TeamParameters['Params'];

    const team_object = await DB.selectOneFrom('teams', '*', { team_id });

    reply.send(team_object);
};
