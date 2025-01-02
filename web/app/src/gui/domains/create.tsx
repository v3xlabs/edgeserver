/* eslint-disable quotes */
import { FormField } from '@/gui/form/FormField';
import { zodResolver } from '@hookform/resolvers/zod';
import { environment } from '@/utils/environment';
import { FC, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { useAuthState } from 'src/hooks/useAuth';
import z from 'zod';

import { ValidateDomain } from './validate';

export const domainRegex =
    /^((?!-))(xn--)?[\da-z][\d_a-z-]{0,61}[\da-z]{0,1}\.(xn--)?([\da-z-]{1,61}|[\da-z-]{1,30}\.[a-z]{2,})$/;

const schema = z.object({
    name: z
        .string()
        .regex(domainRegex, "Hmm... that doesn't look like a valid domain.")
        .min(3, { message: 'Required' }),
});

export type CreateFormData = {
    name: string;
};

export const CreateDomainModal: FC<{
    site_id: string;
    onCreate: () => void;
}> = ({ site_id, onCreate }) => {
    const { auth_token } = useAuthState();
    const { register, handleSubmit, control, getValues, reset } =
        useForm<CreateFormData>({
            resolver: zodResolver(schema),
            reValidateMode: 'onBlur',
            mode: 'onBlur',
        });

    const [checkedDomain, setDNSVerified] = useState('');

    // Somehow the regular formState didnt work... so I had to use this.
    const formState = useFormState({ control });

    const onSubmit = handleSubmit(async (data: CreateFormData) => {
        const v = await fetch(environment.API_URL + `/s/${site_id}/domains`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain: data.name,
            }),
        });

        reset();
        onCreate();
    });

    return (
        <form
            className="flex w-72 flex-col gap-2 border-l px-4"
            onSubmit={onSubmit}
        >
            <div className="bg-black text-white">
                This is supposed to be a modal.
            </div>
            <FormField
                label="Domain (eg. foo.bar.com)"
                properties={{
                    placeholder: 'app.edgeserver.io',
                    ...register('name'),
                }}
            />
            {formState?.errors.name && (
                <div className="w-full border bg-red-50 p-2 text-sm text-red-900">
                    {formState?.errors.name?.message}
                </div>
            )}
            <ValidateDomain
                {...{ control, site_id, formState: formState }}
                onState={(v) => {
                    setDNSVerified(v);
                }}
            />
            <p className="text-xs">
                You might have to verify you own this domain by setting{' '}
                <span>DNS TXT Records</span>.
            </p>
            <button
                type="submit"
                className="tmpbtn"
                disabled={
                    !!formState?.errors.name ||
                    checkedDomain != getValues('name') ||
                    !checkedDomain
                }
            >
                Add Domain
            </button>
        </form>
    );
};
