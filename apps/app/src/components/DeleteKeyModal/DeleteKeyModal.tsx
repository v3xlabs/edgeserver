/* eslint-disable sonarjs/no-duplicate-string */
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import { cx } from '@utils/cx';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';

export const DeleteKeyModal: FC<{
    onClose: () => void;
    key_id: string;
    onDelete: (key_id: string) => void;
}> = ({ onClose, onDelete, key_id }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<{ slider: number }>({
        reValidateMode: 'onChange',
        delayError: 100,
        mode: 'all',
        resolver: async (values) => {
            console.log('validating');

            if (values.slider < 99) {
                console.log('inv slider');

                return {
                    values: {},
                    errors: {
                        slider: { type: 'value', message: 'not-enough' },
                    },
                };
            }

            return {
                values,
                errors: {},
            };
        },
        defaultValues: {
            slider: 0,
        },
    });
    const { token } = useJWT();
    const onSubmit = useCallback(async () => {
        const delete_response = await fetch(environment.API_URL + '/api/keys', {
            method: 'DELETE',
            body: JSON.stringify({
                key_id,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });

        onClose();
        onDelete(key_id);

        if (delete_response.status == 200) return true;

        return false;
    }, []);

    return (
        <Modal label="Manage Key" onClose={onClose}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                    Please drag this cute slider to the right to confirm the
                    destruction of this auth key.
                </div>
                <div>
                    <label
                        htmlFor="slider"
                        className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 pt-4 mb-2"
                    >
                        Verify Deletion
                    </label>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <input
                            type="range"
                            id="slider"
                            step={1}
                            min={1}
                            max={100}
                            className={cx(
                                'text-sm rounded-lg block w-full p-2.5 border human-slider'
                            )}
                            placeholder="32,11"
                            required
                            {...register('slider')}
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    pending={isSubmitting}
                    variant="delete"
                    className="w-full whitespace-pre justify-center"
                    label={
                        isValid
                            ? isSubmitting
                                ? 'Pending...'
                                : 'Anihilate 💥'
                            : 'Drag Slider'
                    }
                />
            </form>
        </Modal>
    );
};
