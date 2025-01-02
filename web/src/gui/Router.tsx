import { RouteComponent } from '@tanstack/react-router';
import { FaSpinner } from 'react-icons/fa6';

export const defaultPendingComponent: RouteComponent = () => (
    <div className="flex h-full grow items-center justify-center">
        <FaSpinner className="size-6 animate-spin" />
    </div>
);
