import { FC } from 'react';
import icon from '../../../assets/favicon.svg';

const links: {
    name: string;
    path: string;
}[] = [
    {
        name: 'Home',
        path: '/',
    },
    {
        name: 'Projects',
        path: '/projects',
    },
];

export const Navbar: FC = () => {
    return (
        <div
            className="w-full p-4
            border-b-2 border-neutral-700"
        >
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
                <div className="flex gap-4 container mx-auto w-full">
                    <img
                        src={icon}
                        alt="Signal Icon"
                        className="flex-0 w-10 h-10"
                    />
                    <div className="ml-auto">
                        <a
                            className="flex px-8 py-2 bg-accent-blue-normal hover:brightness-90 rounded-lg"
                            href="https://app.edgeserver.io"
                        >
                            Launch App
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
