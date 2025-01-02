import { LoginButton } from './gui/LoginButton';
import { toSelectableAccount } from './gui/SelectableAccount';

export const LoginPage = () => {
    const lastAcconts = [
        {
            name: 'luc.eth',
            avatar: 'https://metadata.ens.domains/mainnet/avatar/luc.eth',
        },
        {
            name: 'bckup.eth',
            avatar: 'https://metadata.ens.domains/mainnet/avatar/bckup.eth',
        },
    ];

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-neutral-100/10 text-black">
            <div className="flex w-full max-w-xs flex-col justify-center gap-y-2 rounded-xl border bg-white p-4 shadow-sm">
                <div className="p-2">Edgeserver</div>

                {lastAcconts && (
                    <ul>{lastAcconts?.map(toSelectableAccount)}</ul>
                )}

                <div className="px-3 pb-2 text-sm">
                    <p>
                        You&apos;re about to sign in using passkeys. If you need
                        help{' '}
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
