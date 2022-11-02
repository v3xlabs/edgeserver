import { Container } from '@edgelabs/components';
import { DomainVerificationRequest } from '@edgelabs/types';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { CreateStageConfirm } from './stages/confirm';
import { CreateStageDomain } from './stages/domain';
import { CreateStageName } from './stages/name';

export const CreateAppPage: FC = () => {
    const { token } = useJWT();
    const nav = useNavigate();

    const [stage, setStage] = useState('name');
    const [name, setName] = useState('');
    const [domains, setDomains] = useState([] as DomainVerificationRequest[]);

    const confirm = useCallback(async () => {
        let application_id: string;

        try {
            const application_response = await fetch(
                environment.API_URL + '/api/apps/create',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        domains,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );

            const { site_id: _application_id } =
                await application_response.json();

            application_id = _application_id;
        } catch {
            alert('Error while creating application');
            console.log('error');

            return;
        }

        nav('/app/' + application_id);
    }, [token, name, domains, nav]);

    return (
        <Container size="small" topPadding horizontalPadding>
            <div className="w-full">
                <div className="max-w-5xl w-full mx-auto mt-8">
                    <div className="card p-8 flex flex-col items-start gap-4">
                        {stage == 'name' && (
                            <CreateStageName
                                next={(_name) => {
                                    setName(_name);
                                    setStage('domain');
                                }}
                            />
                        )}
                        {stage == 'domain' && (
                            <CreateStageDomain
                                next={(_domains) => {
                                    setDomains(_domains);
                                    setStage('confirm');
                                }}
                                back={() => setStage('name')}
                            />
                        )}
                        {stage == 'confirm' && (
                            <CreateStageConfirm
                                data={{ domains, name }}
                                next={confirm}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};
