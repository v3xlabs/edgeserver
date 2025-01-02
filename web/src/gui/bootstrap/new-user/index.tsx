import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import { useBootstrap, useLogin } from '@/api';
import { Button, Input } from '@/components';

export const BootstrapNewUser = () => {
    const { mutateAsync: createUser, isPending: isCreatingUser } =
        useBootstrap();
    const navigate = useNavigate();
    const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            console.log(value);

            if (value.password !== value.confirmPassword) {
                return;
            }

            await createUser({
                username: value.username,
                password: value.password,
            });

            await login({
                username: value.username,
                password: value.password,
            });

            navigate({ to: '/', reloadDocument: true });
        },
    });

    return (
        <form
            className="card space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSubmit();
            }}
        >
            <p>
                Welcome to edgeserver! Get started by creating a user account
                below.
            </p>
            {/* TODO: Add validation for username and password */}
            <div className="w-full space-y-2">
                <Field name="username">
                    {({ handleBlur, handleChange, state }) => (
                        <div className="w-full space-y-2">
                            <label htmlFor="username">Username</label>
                            <Input
                                type="text"
                                id="username"
                                placeholder="lucemans"
                                className="w-full"
                                onChange={(event) => {
                                    handleChange(event.target.value);
                                }}
                                onBlur={handleBlur}
                                value={state.value}
                            />
                        </div>
                    )}
                </Field>
                <Field name="password">
                    {({ handleBlur, handleChange, state }) => (
                        <div className="w-full space-y-2">
                            <label htmlFor="password">Password</label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="********"
                                className="w-full"
                                onChange={(event) => {
                                    handleChange(event.target.value);
                                }}
                                onBlur={handleBlur}
                                value={state.value}
                            />
                        </div>
                    )}
                </Field>
                <Field name="confirmPassword">
                    {({ handleBlur, handleChange, state }) => (
                        <div className="w-full space-y-2">
                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <Input
                                type="password"
                                id="confirm-password"
                                placeholder="********"
                                className="w-full"
                                onChange={(event) => {
                                    handleChange(event.target.value);
                                }}
                                onBlur={handleBlur}
                                value={state.value}
                            />
                        </div>
                    )}
                </Field>
            </div>
            <Subscribe>
                {({ isValid }) => (
                    <Button
                        className="w-full"
                        disabled={!isValid || isCreatingUser || isLoggingIn}
                        variant="primary"
                        type="submit"
                    >
                        {match({
                            isCreatingUser,
                            isLoggingIn,
                        })
                            .with(
                                { isCreatingUser: true },
                                () => 'Creating Account'
                            )
                            .with({ isLoggingIn: true }, () => 'Logging In')
                            .otherwise(() => 'Create Account')}
                    </Button>
                )}
            </Subscribe>
        </form>
    );
};
