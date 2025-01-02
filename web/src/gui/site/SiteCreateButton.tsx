import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { Button } from '@/components';

export const SiteCreateButton: FC<{ team_id?: string }> = ({ team_id }) => {
    return (
        <Button asChild>
            <Link to="/site/new" search={{ team_id }}>
                Create Site
            </Link>
        </Button>
    );
};
