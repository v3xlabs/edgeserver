import { Button } from '@edgelabs/components';
import { FC } from 'react';

import { CreateAppDomainState } from './domain'; // LUC what is this???

export const CreateStageConfirm: FC<{
    data: { name: string; domains: CreateAppDomainState[] };
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
