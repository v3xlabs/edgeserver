import { Button } from '@components/Button';
import { FC, useState } from 'react';

export const CreateStageName: FC<{ next: (name: string) => void }> = ({
    next,
}) => {
    const [name, setName] = useState('');

    return (
        <>
            <div>What should your app be named</div>
            <input
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <Button
                label="Next"
                onClick={() => next(name)}
                className="self-end"
            />
        </>
    );
};
