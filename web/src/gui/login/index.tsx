import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import { useLogin } from '@/api';
import { Button, Input } from '@/components';
import { Route } from '@/routes/login';

export const LoginForm = () => {
    const { redirect } = Route.useSearch();
    const navigate = useNavigate();
    const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            await login({
                username: value.username,
                password: value.password,
            });

            if (redirect) {
                navigate({ to: redirect, reloadDocument: false });
            } else {
                navigate({ to: '/', reloadDocument: false });
            }
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
            </div>
            <Subscribe>
                {({ isValid }) => (
                    <Button
                        className="w-full"
                        disabled={!isValid || isLoggingIn}
                        variant="primary"
                        type="submit"
                    >
                        {match({
                            isLoggingIn,
                        })
                            .with({ isLoggingIn: true }, () => 'Logging In')
                            .otherwise(() => 'Sign in')}
                    </Button>
                )}
            </Subscribe>
        </form>
    );
};
