import { environment } from '@utils/enviroment';
import { FC } from 'react';

export const NoDeployments: FC<{ app_id: string }> = ({ app_id }) => {
    return (
        <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl">Make your first deploy 🚀</h2>
            <p>Now that you have created your app you can deploy to it!</p>
            <h3 className="text-xl mt-2">
                Edge CLI (
                <a
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    target="_blank"
                    rel="noreferrer"
                >
                    github
                </a>
                )
            </h3>
            <p>If you would like to generate github</p>
            <pre>edge generate github-action {app_id}</pre>
            <h3 className="text-xl mt-2">
                Github Actions (
                <a
                    href="https://github.com/lvkdotsh/edgeserver-upload"
                    target="_blank"
                    rel="noreferrer"
                >
                    edgeserver-upload
                </a>
                )
            </h3>
            <p>
                Or if you would like to use the github action{' '}
                <code>edgeserver-upload</code> you can copy the following into
                your CI/CD pipeline.
            </p>
            <pre>
                {'- name: Edgeserver Upload\n' +
                    '  uses: lvkdotsh/edgeserver-action@v0.0.34\n' +
                    '  with:\n' +
                    '    app_id: "' +
                    app_id +
                    '"\n' +
                    '    server: ' +
                    environment.API_URL +
                    '\n' +
                    '    token: ${{ secrets.EDGESERVER_TOKEN }}\n' +
                    '    directory: dist'}
            </pre>
            <h3 className="text-xl mt-2">Manual REST API</h3>
            <p>
                Make your first deployment by making a <code>PUT</code> request
                to
            </p>
            <pre>
                {environment.API_URL + '/deployments/push?site=' + app_id}
            </pre>
        </div>
    );
};
