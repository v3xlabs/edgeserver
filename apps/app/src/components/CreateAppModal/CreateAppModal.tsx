/* eslint-disable sonarjs/no-duplicate-string */
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import { cx } from '@utils/cx';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';

export const CreateAppModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<{ domain: string }>({
        reValidateMode: 'onChange',
        delayError: 100,
        mode: 'all',
        resolver: async (values) => {
            console.log('validating');

            if (
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
    const onSubmit = useCallback(async (data: { domain: string }) => {
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

        let application_id: string;

        try {
            const application_response = await fetch(
                environment.API_URL + '/api/apps/create',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name: data.domain.replace(/(\.|\s)/g, '-'),
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

        try {
            const _link_response = await fetch(
                environment.API_URL + '/api/apps/' + application_id + '/link',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        domain_id,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );
        } catch {
            alert('Error while linking application');
            console.log('error');

            return;
        }

        console.log('Successfully created', application_id, domain_id);
        window.location.reload();
        onClose();
    }, []);

    return (
        <Modal label="App Creator" onClose={onClose}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label
                        htmlFor="domain"
                        className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 pt-4 mb-2"
                    >
                        Where will this app be available?
                    </label>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <div>https://</div>
                        <input
                            type="text"
                            id="domain"
                            className={cx(
                                'text-sm rounded-lg block w-full p-2.5 border',
                                errors.domain
                                    ? 'bg-red-500 dark:bg-red-900 bg-opacity-20 border-red-500 focus-visible:outine-red-500'
                                    : 'focus:ring-blue-500 focus:border-blue-500 bg-neutral-50 border-neutral-300 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white'
                            )}
                            placeholder="edgeserver.app"
                            required
                            {...register('domain')}
                        />
                    </div>
                </div>
                <div>
                    <p className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                        And update your DNS records to include
                    </p>
                    <code className="p-2 bg-neutral-200 dark:bg-black-500 w-full block mt-2">
                        {(watch('domain') || 'yoursite.here') +
                            ' CNAME web.lvk.sh'}
                    </code>
                </div>
                <div className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                    DNS Records may take up to 24 hours to update. Yes, the
                    system is archaic. I&apos;m impatient too
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    pending={isSubmitting}
                    className="w-full whitespace-pre justify-center"
                    label={
                        isValid
                            ? isSubmitting
                                ? 'Pending...'
                                : 'Launch  🚀'
                            : 'Incorrect URL'
                    }
                />
            </form>
        </Modal>
    );
};
