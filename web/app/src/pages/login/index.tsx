import { LoginButton } from './components/LoginButton';

export const LoginPage = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center text-black">
            <div className="flex flex-col justify-center gap-y-2 rounded-lg border-[1px] border-black px-20 py-10">
                <div className="flex items-center justify-center gap-x-4">
                    <img
                        src="https://app.edgeserver.io/assets/favicon.d38ec687.svg"
                        alt="logo"
                        className="h-20 w-20"
                    />
                    <p className="text-center text-3xl font-bold uppercase">
                        edgeserver.io
                    </p>
                </div>
                <LoginButton />
            </div>
        </div>
    );
};
