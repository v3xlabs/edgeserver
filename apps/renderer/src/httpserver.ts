import express from 'express';

export const setupHTTP = async () => {
    const app = express();
    const port = 1236;

    // define a route handler for the default home page
    app.get('/', (request, reply) => {
        // render the index template
        reply.send('hi');
    });

    await new Promise<void>((accept) => {
        // start the express server
        app.listen(port, () => {
            // tslint:disable-next-line:no-console
            console.log(`server started at http://localhost:${port}`);
            accept();
        });
    });
};
