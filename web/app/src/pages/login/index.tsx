import { LoginButton } from './components/LoginButton';

export const LoginPage = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-neutral-100/10 text-black">
            <div className="flex w-full max-w-xs flex-col justify-center gap-y-2 rounded-xl border bg-white p-4 shadow-sm">
                <div className="p-2">Edgeserver</div>
                <div className="px-3 pb-2 text-sm">
                    <p>
                        You're about to sign in using passkeys. If you need help{' '}
                        <a
                            href="https://og.ax"
                            className="text-blue-500 hover:underline"
                        >
                            check here
                        </a>
                        .
                    </p>
                </div>
                <LoginButton />
            </div>
        </div>
    );
};
