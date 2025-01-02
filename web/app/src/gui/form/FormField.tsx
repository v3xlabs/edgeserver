import clsx from 'clsx';
import { FC } from 'react';

import { Input } from '@/components/input/Input';

export const FormField: FC<{ label: string; properties: any }> = ({
    label,
    properties: { className, ref, ...properties },
}) => {
    return (
        <div className="">
            <label className="block">{label}</label>
            <Input
                className={clsx('block rounded-md border', className)}
                {...properties}
                _ref={ref}
            />
        </div>
    );
};
