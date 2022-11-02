/* eslint-disable sonarjs/no-duplicate-string */
import { Modal } from '@components/Modal';
import { Button, Checkbox, TextField } from '@edgelabs/components';
import { environment } from '@utils/enviroment';
import { KeyPerms } from '@utils/permissions';
import { useJWT } from '@utils/useAuth';
import decode from 'jwt-decode';
import ms from 'ms';
import { EMPTY_PERMISSIONS, grantPermission } from 'permissio';
import { FC, useCallback, useMemo, useState } from 'react';
import { Clipboard } from 'react-feather';
import { FieldErrors, useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useSignMessage } from 'wagmi';

const titleClass = 'text-neutral-700 dark:text-neutral-300 mb-1 text-lg';

const Perms = {
    'Read Applications': KeyPerms.APPS_READ,
    'Modify/Create Applications': KeyPerms.APPS_WRITE,
    'Delete Applications': KeyPerms.APPS_DELETE,

    'Read Domains': KeyPerms.DOMAINS_READ,
    'Modify/Create Domains': KeyPerms.DOMAINS_WRITE,
    'Delete Domains': KeyPerms.DOMAINS_DELETE,

    'Read Deployments': KeyPerms.DEPLOYMENTS_READ,
    'Modify/Create Deployments': KeyPerms.DEPLOYMENTS_WRITE,
    'Delete Deployments': KeyPerms.DEPLOYMENTS_DELETE,
};

type CreateKeyForm = {
    name: string;
    permanent: boolean;
    expiresIn: string;
    'Full Access': boolean;
} & Record<keyof typeof Perms, boolean>;

export const CreateKeyModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [noPerms, setNoPerms] = useState(false);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<CreateKeyForm>({
        reValidateMode: 'onChange',
        delayError: 100,
        mode: 'all',
        resolver: async (values) => {
            const ValueErrors: FieldErrors<typeof values> = {};

            if (values.name.length === 0)
                ValueErrors.name = { type: 'minLength' };

            if (
                !values.permanent &&
                values.expiresIn &&
                !ms(values.expiresIn)
            ) {
                ValueErrors.expiresIn = {
                    type: 'pattern',
                    message: 'Not a valid timestamp',
                };
            }

            if (
                Object.keys(Perms).every(
                    (key) => !values[key as keyof typeof Perms]
                ) &&
                !values['Full Access']
            ) {
                // errors needs to be a part of the form, otherwise it will be ignored
                // Thus we create a state for when no perms have been selected.
                if (!noPerms) setNoPerms(true);
            } else {
                if (noPerms) setNoPerms(false);
            }

            if (Object.keys(ValueErrors).length > 0) {
                return { values: {}, errors: ValueErrors };
            }

            return {
                values,
                errors: {},
            };
        },
        defaultValues: {
            permanent: false,
            name: '',
            expiresIn: '10h',
        },
    });
    const { data: signedData, signMessageAsync } = useSignMessage();
    const { token } = useJWT();
    const [generatedToken, setGeneratedToken] = useState('');
    const onSubmit = useCallback(async (data: CreateKeyForm) => {
        const decodedToken = decode(token) as {
            exp?: number;
            iat: number;
            instance_id: string;
            key: string;
            owner_id: string;
        };

        const rawPerms = data['Full Access']
            ? [KeyPerms.FULL]
            : Object.keys(Perms)
                  .filter((key) => data[key as keyof typeof Perms])
                  .map((key) => Perms[key as keyof typeof Perms]);

        const permissions = grantPermission(EMPTY_PERMISSIONS, ...rawPerms);

        console.log({ decodedToken });
        const formData: {
            permissions: string;
            name: string;
            expiresIn?: string;
        } = {
            permissions: permissions.toString(),
            name: data.name,
            expiresIn: (!data.permanent && data.expiresIn) || '',
        };

        if (data.permanent) delete formData['expiresIn'];

        const payload = {
            action: 'CREATE_KEY',
            owner_id: decodedToken.owner_id,
            instance_id: decodedToken.instance_id,
            data: formData,
        };
        const stringified_payload = JSON.stringify(payload, undefined, 2);
        const signed_key_request = await signMessageAsync({
            message: stringified_payload,
        });

        if (!signed_key_request) return;

        const domain_response = await fetch(environment.API_URL + '/api/keys', {
            method: 'POST',
            body: JSON.stringify({
                message: stringified_payload,
                payload,
                signature: signed_key_request,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });

        // eslint-disable-next-line unicorn/no-await-expression-member
        setGeneratedToken((await domain_response.json())['token']);
    }, []);

    const [expireDebounce] = useDebounce(watch('expiresIn'), 300);
    const expireString = useMemo(() => {
        if (expireDebounce === undefined) return '';

        try {
            return ms(ms(expireDebounce), { long: true });
        } catch {
            return '';
        }
    }, [expireDebounce]);

    return (
        <Modal label="Key Creator" onClose={onClose}>
            {!generatedToken && (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <div className={titleClass}>
                            <TextField
                                label="Name"
                                type="text"
                                id="name"
                                errorMessage={
                                    errors.name == undefined
                                        ? undefined
                                        : 'Invalid name'
                                }
                                placeholder="My Awesome Key"
                                register={register}
                            />
                        </div>
                    </div>
                    <div>
                        <div className={titleClass}>Key Permissions</div>
                        <div className="grid items-center gap-2 text-neutral-500">
                            <Checkbox
                                id="Full Access"
                                // {...register('Full Access')}
                                register={register}
                            >
                                Full Access
                            </Checkbox>
                            {Object.keys(Perms).map((perm) => (
                                <Checkbox
                                    id={perm}
                                    key={perm}
                                    register={register}
                                    isDisabled={watch('Full Access')}
                                >
                                    {perm}
                                </Checkbox>
                            ))}

                            {noPerms && (
                                <span className="text-red-500">
                                    No permissions selected.
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className={titleClass}>Settings</div>
                        <div className="block w-full">
                            <Checkbox
                                id="permanent"
                                // label=""
                                // className="text-sm rounded-lg block p-2.5 border focus:ring-blue-500 focus:border-blue-500 bg-neutral-50 border-neutral-300 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white"
                                register={register}
                            >
                                Permanent Key
                            </Checkbox>
                        </div>
                    </div>
                    {!watch('permanent') && (
                        <div>
                            <div className={titleClass}>
                                <TextField
                                    label="Expires In"
                                    type="text"
                                    id="expiresIn"
                                    errorMessage={
                                        errors.expiresIn == undefined
                                            ? undefined
                                            : 'Invalid date'
                                    }
                                    placeholder="10h"
                                    register={register}
                                />
                            </div>

                            {expireString && (
                                <div className="mt-2 text-neutral-500">
                                    {expireString}
                                </div>
                            )}
                        </div>
                    )}
                    <Button
                        type="submit"
                        isDisabled={isSubmitting || !isValid || noPerms}
                        loading={isSubmitting}
                        // variant="primary"
                        className="mt-4 w-full whitespace-pre"
                    >
                        {isValid && !noPerms
                            ? isSubmitting
                                ? 'Pending...'
                                : 'Create 🔑'
                            : 'Select Permissions'}
                    </Button>
                </form>
            )}
            {generatedToken && (
                <div>
                    <p className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                        Here is your API Key, we will only show this once.
                    </p>
                    <div className="flex mt-2">
                        <input
                            id="generated_token"
                            className="p-2 dark:bg-black-500 bg-slate-300 w-full block overflow-hidden"
                            value={generatedToken}
                        />
                        <button
                            className="w-10 h-10 border-neutral-400 border-2 flex items-center justify-center"
                            onClick={() => {
                                const copyText = document.querySelector(
                                    '#generated_token'
                                ) as HTMLInputElement;

                                copyText.select();
                                copyText.setSelectionRange(0, 99_999);
                                navigator.clipboard.writeText(copyText.value);

                                const c = copyText.value;

                                copyText.value = '-- Copied! --';

                                setTimeout(() => {
                                    copyText.value = c;
                                }, 500);
                            }}
                        >
                            <Clipboard />
                        </button>
                    </div>
                    <Button className="w-full mt-4" onPress={onClose}>
                        I wrote it down
                    </Button>
                </div>
            )}
        </Modal>
    );
};
