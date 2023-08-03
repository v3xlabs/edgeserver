/* eslint-disable react/display-name */
import { toComponent } from '@utils/toComponent';
import { FC } from 'react';
import { FiArrowRight } from 'react-icons/fi';

export const SelectableAccount: FC<{
    data: { name: string; avatar: string };
}> = ({ data }) => {
    return (
        <li key={'account-' + data.name}>
            <button className="group flex w-full items-center gap-x-2 rounded-xl p-2 font-bold outline-neutral-400 transition hover:bg-gray-100 focus:bg-gray-100">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    <img
                        src={data.avatar}
                        className="h-8 w-8 rounded-full"
                        alt=""
                    />
                </div>
                <span className="grow text-left">{data.name}</span>
                <FiArrowRight className="-translate-x-3 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus:translate-x-0 group-focus:opacity-100" />
            </button>
        </li>
    );
};

export const toSelectableAccount = toComponent(SelectableAccount);
