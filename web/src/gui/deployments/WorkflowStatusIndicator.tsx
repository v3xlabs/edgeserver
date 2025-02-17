import { FC, Fragment } from 'react';
import { FiCheckCircle, FiClock, FiUpload } from 'react-icons/fi';
import { match } from 'ts-pattern';

export type WorkflowStatusVariant = 'small' | 'expanded';

export const WorkflowStatusIndicator: FC<{
    status: string;
    variant?: WorkflowStatusVariant;
}> = ({ status, variant = 'small' }) => {
    const Wrapper = variant === 'expanded' ? 'div' : Fragment;
    const wrapperProperties =
        variant === 'small'
            ? {}
            : {
                  className: 'flex items-center gap-1.5',
              };

    return (
        <Wrapper {...wrapperProperties}>
            {match(status)
                .with('pre', () => <FiClock className="text-yellow-500" />)
                .with('push', () => <FiUpload className="text-blue-400" />)
                .with('post', () => (
                    <FiCheckCircle className="text-green-500" />
                ))
                .otherwise((status) => (
                    <div>{status}?</div>
                ))}
            {variant === 'expanded' && (
                <div>
                    {match(status)
                        .with('pre', () => 'Starting')
                        .with('push', () => 'Uploading...')
                        .with('post', () => 'Deployed')
                        .otherwise(() => status)}
                </div>
            )}
        </Wrapper>
    );
};
