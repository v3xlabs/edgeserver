/* eslint-disable sonarjs/no-identical-functions */
import { cx } from '@utils/cx';
import { useAppByID } from '@utils/queries/useAppByID';
import { useApps } from '@utils/queries/useApps';
import { useAuth } from '@utils/useAuth';
import { FC, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import logo from '../../../assets/logo.svg';
import { ChainSwap } from './ChainSwap';
import { UserProfile } from './UserProfile';

const links: {
    name: string;
    path: string;
    end?: boolean;
}[] = [
    {
        name: 'Dashboard',
        path: '/',
        end: true,
    },
    {
        name: 'Auth Keys',
        path: '/keys',
    },
    {
        name: 'Settings',
        path: '/settings',
    },
];

export const Navbar: FC = () => {
    const { userData } = useAuth();
    // const app_id = useAppData((state) => state.app_id);
    const { pathname } = useLocation();
    const { app_id, deploy_id } = useMemo(() => {
        const app_id_matches = pathname.match(/^\/app\/(?<app_id>\d+)/);
        const deploy_id_matches = pathname.match(
            /^\/app\/(\d+)\/deployment\/(\d+)/
        );

        return {
            app_id:
                (app_id_matches &&
                    app_id_matches.length == 2 &&
                    app_id_matches.at(1)) ||
                undefined,
            deploy_id:
                (deploy_id_matches &&
                    deploy_id_matches.length == 3 &&
                    deploy_id_matches.at(2)) ||
                undefined,
        };
    }, [pathname]);
    const app = useAppByID(app_id);
    const { data: appData, isSuccess: appDataSuccess } = useApps();

    const [baseType, setBaseType] = useState(0);

    return (
        <>
            <div className="flex justify-between w-full border-b border-neutral-300 dark:border-neutral-700 h-12 dark:bg-black-800 bg-neutral-50 relative z-50">
                <div className="flex">
                    <Link
                        className="flex gap-2 h-full items-center px-4 border-r border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                        to="/"
                    >
                        <img src={logo} alt="" className="w-6 h-6" />
                        {/* <div className="w-4 h-4 bg-white cursor-pointer"></div> */}
                        <div>
                            <div className="to-pink-800 from-purple-700 brightness-150 bg-gradient-to-br bg-clip-text text-transparent font-bold leading-none">
                                Edgeserver
                            </div>

                            <div className="leading-none text-sm">
                                <span className="text-neutral-400">by </span>
                                edgelabs
                            </div>
                        </div>
                    </Link>

                    {[
                        ['Apps', '/'],
                        ['Domains', '/domains'],
                    ].map((entry, index) => (
                        <NavLink
                            to={entry.at(1) || '/'}
                            className={({ isActive }) =>
                                cx(
                                    'h-full block relative',
                                    (isActive && 'navlink-active') || ''
                                )
                            }
                            key={index}
                        >
                            <div className="flex items-center w-fit h-full border-r border-neutral-300 dark:border-neutral-700 pl-4 pr-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <div className="navtext">{entry.at(0)}</div>
                            </div>
                        </NavLink>
                    ))}

                    {!app_id && userData?.admin && (
                        <NavLink
                            to={'/admin'}
                            className={({ isActive }) =>
                                cx(
                                    'h-full block relative',
                                    (isActive && 'navlink-active') || ''
                                )
                            }
                        >
                            <div className="flex items-center w-fit h-full border-r border-neutral-300 dark:border-neutral-700 pl-4 pr-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <div className="navtext">Admin</div>
                            </div>
                        </NavLink>
                    )}
                    {/* <NavDropdown
                        list={[
                            { label: 'Dashboard', id: 0 },
                            { label: 'Apps', id: 1 },
                            { label: 'Domains', id: 2 },
                            { label: 'Settings', id: 3 },
                        ]}
                        active={baseType}
                        onChange={setBaseType}
                    />
                    {baseType == 1 && (
                        <NavDropdown
                            list={
                                appDataSuccess && appData
                                    ? appData.map((app, index) => ({
                                          id: index,
                                          label: app.name,
                                          link: '/app/' + app.app_id,
                                      }))
                                    : [{ label: 'Loading...', id: -1 }]
                            }
                            active={0}
                            onChange={() => {}}
                        />
                    )}
                    {baseType == 1 && (
                        <NavDropdown
                            list={[{ label: '123456789', id: -1 }]}
                            active={0}
                            onChange={() => {}}
                        />
                    )} */}
                    {/* <div
                    className="w-full max-w-4xl mx-auto
                    flex flex-col"
                    >
                    <div className="flex gap-4 items-center flex-wrap containerd">
                    <Link to={'/'}>
                    <img
                    src={icon}
                                alt="Signal Icon"
                                className="flex-0 w-10 hover:scale-105"
                                />
                        </Link>
                        <h1 className="text-xl font-bold hidden sm:block">
                            {app_id
                                ? deploy_id
                                ? `Deployment #${deploy_id}`
                                : `${
                                          (app?.data && app.data.name) || app_id
                                      }`
                                : 'Edge Server'}
                        </h1>
                        <div className="ml-auto">
                        <UserProfile />
                        </div>
                        </div>
                    </div> */}
                </div>
                <div className="flex">
                    <ChainSwap />
                    <UserProfile />
                </div>
            </div>
            {/* <div className="sticky top-0 left-0 right-0 w-full flex h-16 items-end bg-black-900 border-b-2 border-neutral-700">
                <div className="flex justify-between containerd">
                    <div className="flex">
                        {!app_id &&
                            links.map((link) => (
                                <NavbarLink
                                    key={link.name}
                                    name={link.name}
                                    path={link.path}
                                    end={link.end || false}
                                />
                            ))}

                        {!app_id && admin === true && (
                            <NavbarLink
                                key={'admin'}
                                name={'Admin'}
                                path={'/admin'}
                            />
                        )}

                        {app_id && (
                            <>
                                <NavbarLink
                                    name="Application"
                                    path={'/app/' + app_id}
                                    end
                                />
                                {deploy_id ? (
                                    <NavbarLink
                                        name={`Deployments ${deploy_id}`}
                                        path={'/app/' + app_id + '/deployments'}
                                        path_match={
                                            '/app/' +
                                            app_id +
                                            '/deployment/' +
                                            deploy_id
                                        }
                                    />
                                ) : (
                                    <NavbarLink
                                        name="Deployments"
                                        path={'/app/' + app_id + '/deployments'}
                                    />
                                )}
                                <NavbarLink
                                    name="Settings"
                                    path={'/app/' + app_id + '/settings'}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div> */}
        </>
    );
};
