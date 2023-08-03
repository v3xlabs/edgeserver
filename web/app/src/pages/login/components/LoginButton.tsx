/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useState } from 'react';
// import { useAuth } from 'src/hooks/useAuth';

const walletSelectURL = 'http://10.0.0.103:5174';

export const LoginButton = () => {
    // const { user } = useAuth();
    const [data, setData] = useState();

    const handleEvents = useCallback((event: MessageEvent) => {
        // if (event.origin !== 'http://example.org:8080') return;

        console.log(event.data);

        if (event.data['type'] === 'walletselect') {
            console.log('message', event.data);

            setData(event.data);
            // alert(event.data['msg']);
        }
    }, []);

    useEffect(() => {
        // attach handleEvents to window
        window.addEventListener('message', handleEvents);

        // detach handleEvents from window
        return () => {
            window.removeEventListener('message', handleEvents);
        };
    }, [handleEvents]);

    return (
        <>
            <span>hi: {JSON.stringify(data)}</span>
            <button
                className="group flex items-center justify-center rounded-lg bg-gray-100 p-2 font-bold transition hover:brightness-95"
                onClick={() => {
                    const width = 400;
                    const height = 600;
                    const parameters = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
                width=${width},height=${height},top=${
                        screen.height / 2 - height / 2
                    },left=${screen.width / 2 - width / 2}`;

                    const nwin = open(
                        new URL('/sign', walletSelectURL),
                        'test',
                        parameters
                    );

                    if (!nwin) return;

                    setTimeout(() => {
                        console.log('Sending Session Info');
                        nwin?.postMessage(
                            {
                                type: 'walletselect',
                                goal: 'load_session',
                                data: {
                                    session: {
                                        app: {
                                            name: 'Edgeserver',
                                        },
                                    },
                                },
                            },
                            walletSelectURL
                        );
                        setTimeout(() => {
                            nwin?.postMessage(
                                {
                                    type: 'walletselect',
                                    goal: 'test_A',
                                    data: { foo: 'worllllld' },
                                },
                                walletSelectURL
                            );
                        }, 6000);
                    }, 200);
                }}
            >
                Connect
            </button>
        </>
    );
};
