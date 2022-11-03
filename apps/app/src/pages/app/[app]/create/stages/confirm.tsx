import { Button } from '@edgelabs/components';
import { DomainVerificationRequest } from '@edgelabs/types';
import { FC } from 'react';

export const CreateStageConfirm: FC<{
    data: { name: string; domains: DomainVerificationRequest[] };
    next: () => void;
}> = ({ next, data }) => {
    return (
        <>
            <div>Are you ready? Confirm Creation</div>
            <pre className="whitespace-pre">
                <p>Name: {data.name}</p>
                <p>Domains: {JSON.stringify(data.domains)}</p>
            </pre>
            <Button onPress={next} className="self-end">
                Create
            </Button>
        </>
    );
};
