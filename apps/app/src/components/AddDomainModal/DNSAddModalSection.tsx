import { Button, TextField } from '@edgelabs/components';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { FC, useCallback } from 'react';
import { Check, X } from 'react-feather';
import { useForm } from 'react-hook-form';

import { DNSRecordTester } from './DNSRecordTester';

export const DNSAddModalSection: FC = () => {
    const {
        register,
        handleSubmit,
        getValues,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<{ domain?: string }>({
        reValidateMode: 'onChange',
        delayError: 100,
        mode: 'all',
        resolver: async (values) => {
            console.log('validating');

            if (
                !values.domain ||
                !/^((?!-))(xn--)?[\da-z][\w-]{0,61}[\da-z]*\.?((xn--)?([\d.a-z-]{1,61}|[\da-z-]{1,30})\.?[a-z]{2,})$/gim.test(
                    values.domain
                )
            ) {
                console.log('inv domain');

                return {
                    values: {},
                    errors: {
                        domain: { type: 'value', message: 'not-domain' },
                    },
                };
            }

            return {
                values,
                errors: {},
            };
        },
    });
    const { token } = useJWT();
    const onSubmit = useCallback(async (data: { domain?: string }) => {
        console.log(data);
        await new Promise<void>((accept) => setTimeout(accept, 1000));

        let domain_id;

        try {
            const domain_response = await fetch(
                environment.API_URL + '/api/domains/create',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        host: data.domain,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );

            const { domain_id: _domain_id } = await domain_response.json();

            domain_id = _domain_id as string;
        } catch {
            alert('Error while creating domain');
            console.log('error');

            return;
        }

        console.log('Successfully created', domain_id);
        // TODO: Close the window
    }, []);

    return (
        <div className="pt-2">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="text-neutral-500">
                        When entering your domain, try and look at the
                        following:
                    </div>

                    <div className="mx-auto w-fit">
                        {[
                            ['example.com', true],
                            ['example.com/', false],
                            ['http://example.com', false],
                            ['10.0.0.1', false],
                        ].map((example) => (
                            <div className="flex" key={example.at(0) as string}>
                                {example.at(1) ? (
                                    <span className="text-green-500">
                                        <Check />
                                    </span>
                                ) : (
                                    <span className="text-red-500">
                                        <X />
                                    </span>
                                )}
                                &nbsp;
                                <span>{example.at(0)}</span>
                            </div>
                        ))}
                    </div>

                    <label
                        htmlFor="domain"
                        className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 pt-4 mb-2"
                    >
                        Domain
                    </label>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <TextField
                            type="text"
                            id="domain"
                            errorMessage={
                                errors.domain == undefined
                                    ? undefined
                                    : 'Invalid domain'
                            }
                            placeholder="edgeserver.app"
                            register={register}
                        />
                    </div>
                </div>

                {isValid && (
                    <DNSRecordTester domain={getValues('domain') || ''} />
                )}

                <Button
                    type="submit"
                    isDisabled={isSubmitting || !isValid}
                    loading={isSubmitting}
                    className="w-full whitespace-pre justify-center"
                >
                    {isValid
                        ? isSubmitting
                            ? 'Pending...'
                            : 'Launch  🚀'
                        : 'Incorrect URL'}
                </Button>
            </form>
        </div>
    );
};
