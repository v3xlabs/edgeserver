import { Button, TextField } from '@edgelabs/components';
import { FC, useState } from 'react';

export const CreateStageName: FC<{ next: (name: string) => void }> = ({
    next,
}) => {
    const [name, setName] = useState('');

    return (
        <>
            <TextField
                label="What should your app be named?"
                placeholder="App name"
                onChange={(value) => setName(value)}
            />
            <Button onPress={() => next(name)} className="self-end">
                Next
            </Button>
        </>
    );
};
