/* eslint-disable unicorn/no-null */
import { FC } from 'react';
import { Control, FormState, useWatch } from 'react-hook-form';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { useSite } from 'src/hooks/useSite';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';

import { CreateFormData, domainRegex } from './create';

const SiteReference: FC<{ site_id: string }> = ({ site_id }) => {
    const { data } = useSite(site_id);

    return (
        <a
            href={`/s/${site_id}`}
            className="text-blue-500 underline hover:text-blue-600"
        >
            {data?.name || site_id}
        </a>
    );
};

export const ValidateDomain: FC<{
    control: Control<CreateFormData, any>;
    site_id: string;
    formState: FormState<CreateFormData>;
    onState: (v: string) => void;
}> = ({ control, site_id, formState: { errors }, onState }) => {
    const { name } = useWatch({
        control,
    });
    const [debouncedValue] = useDebounce(name, 500);

    const invalidInput =
        domainRegex.test(name || '') === false ||
        domainRegex.test(debouncedValue || '') === false ||
        !!errors.name;

    const {
        data: availableData,
        isLoading: isLoadingAvailableData,
        error: availableError,
    } = useSWR<{
        success: boolean;
        dns_passed?: boolean;
        domain_available?: boolean | string;
    }>(
        () =>
            debouncedValue &&
            !invalidInput &&
            `/s/${site_id}/domains/available?domain=${debouncedValue}`,
        {
            onSuccess: (data) => {
                onState(data.success ? debouncedValue : '');
            },
        }
    );

    if (invalidInput) return null;

    const isLoading = isLoadingAvailableData || name != debouncedValue;

    if (isLoading)
        return (
            <div className="flex w-full items-center bg-blue-50 p-4 text-blue-900">
                <span>Loading...</span>
                <FiLoader className="ml-2 animate-spin" />
            </div>
        );

    if (!availableData) return <div>Unavailable Data</div>;

    if (!availableData.success) {
        if (availableData.domain_available == site_id) {
            return (
                <div className="w-full border bg-red-50 p-2 text-sm text-red-900">
                    That is a joke... <span className="font-bold">right</span>?
                    🤔
                </div>
            );
        }

        return (
            <div
                className={
                    'flex w-full flex-col gap-2 border bg-red-50 p-2 text-red-900'
                }
            >
                {availableData.dns_passed === false && (
                    <div className="text-sm">
                        Could not validate DNS, please set{' '}
                        <span className="underline">this TXT record.</span>
                    </div>
                )}
                {(typeof availableData.domain_available === 'string' && (
                    <div className="text-sm">
                        Domain is not available because it is owned by{' '}
                        <SiteReference
                            site_id={availableData.domain_available}
                        />
                    </div>
                )) || <div className="text-sm">Why am i seeing this 👇</div>}
            </div>
        );
    }

    return (
        <div className="w-full border bg-green-50 p-2 text-green-900">
            <FiCheck className="mr-2 inline-block" />
            Pre-Check Passed!
        </div>
    );
};
