import { FormField } from '@/gui/form/FormField';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useSite } from 'src/hooks/useSite';
import z from 'zod';

const schema = z.object({
    name: z.string().min(3, { message: 'Required' }),
    permission: z.string().min(1),
});

type FormData = {
    name: string;
    permission: string;
};

export const CreateTokenModal: FC<{ team_id: string; site_id?: string }> = ({
    team_id,
    site_id,
}) => {
    const { register, formState, handleSubmit } = useForm<FormData>({
        defaultValues: {
            permission: '1',
        },
        resolver: zodResolver(schema),
    });
    const { data: siteData } = useSite(site_id);

    const onSubmit = handleSubmit((data: FormData) => {
        console.log(data);
    });

    return (
        <form className="flex flex-col gap-2 border-l px-4" onSubmit={onSubmit}>
            <div className="bg-black text-white">
                This is supposed to be a modal.
            </div>
            <FormField
                label="Name"
                properties={{
                    placeholder: 'My API Key',
                    ...register('name'),
                }}
            />
            <FormField
                label="Permissions (Debug)"
                properties={{
                    placeholder: '1',
                    ...register('permission'),
                }}
            />
            {(site_id && (
                <div>
                    This key will be restricted to:{' '}
                    <span className="font-bold">
                        {(siteData && siteData.name) || siteData?.site_id}
                    </span>
                    .
                </div>
            )) || (
                <div>
                    This key will be{' '}
                    <span className="font-bold">Organization-wide</span>.
                </div>
            )}
            <button
                type="submit"
                className="tmpbtn"
                disabled={!formState.isValid}
            >
                Create API Key
            </button>
        </form>
    );
};
