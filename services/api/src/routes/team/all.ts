import { FastifyPluginAsync } from 'fastify';
import { eqIn } from 'scyllo';

import { DB } from '../../database/index.js';

export const AllTeamRoute: FastifyPluginAsync = async (router) => {
    router.get('/', async (request, reply) => {
        // Get a list of all teams the user is in
        const user_data = await DB.selectOneFrom('users', ['teams'], {
            user_id: request.token.address,
        });

        // If the user doesn't exist, return 404
        if (!user_data) return reply.status(404).send('User not found');

        const { teams } = user_data;

        // Get the data for all the teams the user is in
        const teams_data = await DB.selectFrom('teams', '*', {
            team_id: eqIn(...teams),
        });

        // Return the data
        reply.send(JSON.stringify(teams_data || []));
    });
};
