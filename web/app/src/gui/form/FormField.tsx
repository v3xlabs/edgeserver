import { Input } from '@/gui/input/Input';
import { cx } from '@/utils/cx';
import { FC } from 'react';

export const FormField: FC<{ label: string; properties: any }> = ({
    label,
    properties: { className, ref, ...properties },
}) => {
    return (
        <div className="">
            <label className="block">{label}</label>
            <Input
                className={cx('block border rounded-md', className)}
                {...properties}
                _ref={ref}
            />
        </div>
    );
};

