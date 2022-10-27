import { cx } from '@utils/cx';
import { FC, ReactNode } from 'react';

export interface CodeBlockProperties {
    children: ReactNode;
    className?: string;
}

const CodeBlock: FC<CodeBlockProperties> = (properties) => {
    return (
        <div className="text-black dark:text-white overflow-auto bg-neutral-200 dark:bg-neutral-800 rounded-md text-sm">
            <pre className={cx('break-normal py-4', properties.className)}>
                <code className="px-4">{properties.children}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
