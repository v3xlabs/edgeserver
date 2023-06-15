type TeamParameters = {
    Body: {
        type: 'personal' | 'organization';
    };
};

const PostTeamRoute = async (request, reply) => {
    const { team_id } = request.params as TeamParameters['Params'];

    const team_object = await DB.selectOneFrom('teams', '*', { team_id });

    reply.send(team_object);
};
