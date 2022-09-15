import { Listbox } from '@headlessui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cx } from '@utils/cx';
import { formatAddress } from '@utils/formatAddress';
import { gradientAvatar } from '@utils/gradientAvatar';
import { useENS } from '@utils/queries/useENS';
import { toggleTheme } from '@utils/useTheme';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const UserProfile: FC = () => {
    const { data: userData, isSuccess } = useAccount();
    const { disconnect } = useDisconnect({});

    const { activeConnector } = useConnect();

    const { Name, Avatar } = useENS();

    if (!isSuccess || !userData || !userData.address) return <></>;

    return (
        <Listbox
            value="1"
            onChange={() => {}}
            as="div"
            className="border-l min-w-fit w-64 border-neutral-300 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
            <Listbox.Button as="div" className="h-full">
                <ConnectButton.Custom>
                    {({ openAccountModal }) => {
                        return (
                            <button
                                className="flex items-center justify-end h-full pr-4 pl-4 gap-2 w-full"
                                // onClick={openAccountModal}
                            >
                                <div className="">
                                    <div className="text-2 font-bold text-right leading-tight">
                                        {Name
                                            ? `${Name}`
                                            : formatAddress(userData.address!)}
                                    </div>
                                    <div className="text-1 opacity-50 text-right text-xs leading-3">
                                        {Name &&
                                            formatAddress(userData.address!)}
                                        {/* Logged in with{' '}
                                    <b>
                                        {capitalizeFirstLetter(
                                            activeConnector?.id || 'unknown'
                                        )}
                                    </b> */}
                                    </div>
                                </div>
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-neutral-700">
                                    {Avatar ? (
                                        <img
                                            src={Avatar}
                                            className="w-8 h-8 rounded-full"
                                            alt="ENSavatar"
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full overflow-hidden"
                                            dangerouslySetInnerHTML={{
                                                __html: gradientAvatar(
                                                    userData.address!
                                                ),
                                            }}
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    }}
                </ConnectButton.Custom>
            </Listbox.Button>
            <Listbox.Options
                as="div"
                className="bg-neutral-50 dark:bg-black-800 border border-neutral-300 dark:border-neutral-700"
                style={{
                    marginLeft: '-1px',
                    paddingRight: '1px',
                    marginRight: '-1px',
                }}
            >
                {[
                    { link: '/settings', label: 'Settings', icon: '⚙️' },
                    { link: '/keys', label: 'Auth Keys', icon: '🔑' },
                ].map((link, index) => (
                    <Listbox.Option value="1" className="list-none" key={index}>
                        <NavLink
                            to={link.link}
                            className={({ isActive }) =>
                                cx(
                                    'p-2 pl-4 py-4 w-full block text-start hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                    (isActive &&
                                        'border-l-4 border-blue-500') ||
                                        ''
                                )
                            }
                        >
                            <span className="w-6 min-h-fit h-2 inline-flex justify-end">
                                {link.icon}
                            </span>{' '}
                            {link.label}
                        </NavLink>
                    </Listbox.Option>
                ))}
                <Listbox.Option value="1" className="list-none">
                    <button
                        className={
                            'p-2 pl-4 py-4 w-full block text-start hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }
                        onClick={() => {
                            toggleTheme();
                        }}
                    >
                        <span className="w-6 inline-flex justify-end min-h-fit h-2">
                            <span className="themebtn"></span>
                        </span>{' '}
                        Change Theme
                    </button>
                </Listbox.Option>
                <Listbox.Option value="1" className="list-none">
                    <button
                        className={
                            'p-2 pl-4 py-4 w-full block text-start bg-red-500 bg-opacity-0 hover:bg-opacity-25'
                        }
                        onClick={() => disconnect()}
                    >
                        <span className="w-6 inline-flex justify-end min-h-fit h-2">
                            <span className="leavebtn"></span>
                        </span>{' '}
                        Logout
                    </button>
                </Listbox.Option>
            </Listbox.Options>
        </Listbox>
    );
};
