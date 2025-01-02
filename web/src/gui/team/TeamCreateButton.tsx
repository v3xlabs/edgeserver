import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { Button } from '@/components';

export const TeamCreateButton: FC = () => {
    return (
        <Button asChild>
            <Link to="/team/new">Create Team</Link>
        </Button>
    );
};
