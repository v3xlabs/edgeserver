import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { Button } from '@/components';

export const SiteCreateButton: FC = () => {
    return (
        <Button asChild>
            <Link to="/site/new">Create Site</Link>
        </Button>
    );
};
