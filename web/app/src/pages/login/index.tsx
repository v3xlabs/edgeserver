import { LoginButton } from './components/LoginButton';

export const LoginPage = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-neutral-100/10 text-black">
            <div className="flex w-full max-w-xs flex-col justify-center gap-y-2 rounded-xl border bg-white p-4 shadow-sm">
                <div className="p-2">Edgeserver</div>
                <LoginButton />
            </div>
        </div>
    );
};
