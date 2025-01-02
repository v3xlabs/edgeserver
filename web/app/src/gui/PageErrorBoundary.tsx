import { ErrorRouteComponent, Link } from '@tanstack/react-router';

import { ApiError, BASE_URL } from '@/api/core';
import { SCPage } from '@/layouts';
import { Button } from '@/components';

export const PageErrorBoundary: ErrorRouteComponent = ({
    error,
    info,
    reset,
}) => {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return (
            <SCPage title="Unauthorized">
                <div className="card space-y-4">
                    <div>You are not authorized to access this page</div>
                    {/* <Button onClick={reset}>Retry</Button> */}
                    {/* {!meData && ( */}
                    <div className="flex w-full items-center justify-between">
                        Try logging in.
                        <Button asChild>
                            <Link
                                to="/login"
                                search={{ redirect: window.location.href }}
                                data-testid="login-button"
                            >
                                Login
                            </Link>
                        </Button>
                    </div>
                    {/* )} */}
                </div>
            </SCPage>
        );
    }

    return (
        <SCPage title="Error Report">
            <div className="card">
                <div>Looks like there was an issue here</div>
                <div>{error.message}</div>
            </div>
            <div>{JSON.stringify(info)}</div>
        </SCPage>
    );
};
