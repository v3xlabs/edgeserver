/* eslint-disable sonarjs/no-duplicate-string */
import { Modal } from '@components/Modal';
import { Button } from '@edgelabs/components';
import { cx } from '@utils/cx';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useEnsAddress, useSignMessage } from 'wagmi';

export const UsersModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<{ address: string }>({
        reValidateMode: 'onChange',
        delayError: 100,
        mode: 'all',
        resolver: async (values) => {
            if (values.address?.length === 0)
                return {
                    values: {},
                    errors: {
                        address: { type: 'minLength' },
                    },
                };

            if (
                !/^0x[\dA-Fa-f]{40}$/.test(values.address) &&
                !/(?:[\da-z](?:[\da-z-]{0,61}[\da-z])?\.)+[\da-z][\da-z-]{0,61}[\da-z]/.test(
                    values.address
                )
            ) {
                console.log('valid address');

                return {
                    values: {},
                    errors: {
                        address: { type: 'pattern' },
                    },
                };
            }

            return {
                values,
                errors: {},
            };
        },
    });

    const [debouncedAddress, debounceCtl] = useDebounce(watch('address'), 500);
    const ensAddress = useEnsAddress({
        name: debouncedAddress,
    });

    const [usersError, setUsersError] = useState('');

    const { data: signedData, signMessageAsync } = useSignMessage();
    const { token } = useJWT();
    const onSubmit = useCallback(
        async (data: { address: string }) => {
            const payload = {
                action: 'USERS_ADD',
                address: ensAddress.data || data.address,
            };

            const stringified_payload = JSON.stringify(payload, undefined, 2);
            const signed_add_request = await signMessageAsync({
                message: stringified_payload,
            });

            if (!signed_add_request) return;

            const users_response = await fetch(
                environment.API_URL + '/api/admin/users/add',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        message: stringified_payload,
                        payload,
                        signature: signed_add_request,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );

            if (users_response.status === 200) {
                onClose();

                return;
            }

            setUsersError(
                `${users_response.status} ${users_response.statusText}`
            );
        },
        [ensAddress]
    );

    return (
        <Modal label="Users Add" onClose={onClose} className="!max-w-lg">
            <form
                className="flex flex-col gap-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="mb-4">
                    <label
                        htmlFor="permissions"
                        className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2"
                    >
                        Address
                    </label>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <input
                            type="text"
                            id="address"
                            className={cx(
                                'text-sm rounded-lg block w-full p-2.5 border',
                                errors.address
                                    ? 'bg-red-900 bg-opacity-20 border-red-500 focus-visible:outine-red-500'
                                    : 'focus:ring-blue-500 focus:border-blue-500 bg-neutral-50 border-neutral-300 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white'
                            )}
                            placeholder="edgeserver.eth"
                            required
                            {...register('address')}
                        />
                    </div>

                    {ensAddress.data &&
                        ensAddress.data !== watch('address') && (
                            <div className="mt-2 text-neutral-500">
                                {ensAddress.data}
                            </div>
                        )}
                </div>

                {usersError && (
                    <div className="bg-red-500/50 rounded-md py-2 px-4">
                        <span className="text-red-500 opacity-100">
                            {usersError}
                        </span>
                    </div>
                )}

                {!errors.address && (
                    <Button
                        type="submit"
                        isDisabled={
                            isSubmitting ||
                            !isValid ||
                            ensAddress.isLoading ||
                            debounceCtl.isPending()
                        }
                        loading={
                            isSubmitting ||
                            ensAddress.isLoading ||
                            debounceCtl.isPending()
                        }
                        variant="primary"
                        className="w-full whitespace-pre justify-center"
                    >
                        {isValid
                            ? isSubmitting
                                ? 'Pending...'
                                : 'Add'
                            : 'Enter Address'}
                    </Button>
                )}

                {errors.address && (
                    <Button
                        type="submit"
                        isDisabled
                        loading={isSubmitting}
                        variant="delete"
                        className="w-full whitespace-pre justify-center"
                    >
                        Invalid Input
                    </Button>
                )}
            </form>
        </Modal>
    );
};
