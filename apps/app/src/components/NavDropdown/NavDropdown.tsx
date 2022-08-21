import { Listbox } from '@headlessui/react';
import { cx } from '@utils/cx';
import { FC, Fragment, ReactNode, useState } from 'react';

type DropdownEntry = {
    id: number;
    label: string;
    link?: string;
    icon?: ReactNode;
};

export const NavDropdown: FC<{
    list: DropdownEntry[];
    active: number;
    onChange: (v: number) => void;
}> = ({ list, active: defaultActive, onChange }) => {
    const [selectedEntry, setSelectedEntry] = useState(defaultActive);
    // const [selectedPerson, setSelectedPerson] = useState(people.at(0));

    return (
        <div className="h-full block relative">
            <Listbox
                value={selectedEntry}
                onChange={(v) => {
                    setSelectedEntry(v);
                    onChange(v);
                }}
            >
                <Listbox.Button className="flex items-center w-fit h-full border-r border-neutral-300 dark:border-neutral-700 pl-4 pr-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    {list[selectedEntry].label}
                </Listbox.Button>
                <Listbox.Options
                    className={
                        'absolute top-full w-fit left-0 min-w-full border border-neutral-300 dark:border-neutral-700 max-h-96 overflow-y-auto'
                    }
                >
                    {list.map((entry) => (
                        /* Use the `active` state to conditionally style the active option. */
                        /* Use the `selected` state to conditionally style the selected option. */
                        <Listbox.Option
                            key={entry.id}
                            value={entry.id}
                            as={Fragment}
                        >
                            {({ active, selected }) => (
                                <li
                                    className={cx(
                                        'w-auto h-16 flex items-center cursor-pointer',
                                        selected || active
                                            ? 'bg-neutral-200 dark:bg-neutral-800'
                                            : 'bg-neutral-50 dark:bg-black-800'
                                    )}
                                >
                                    <div className="px-4 py-2 min-w-full whitespace-nowrap block">
                                        {selected && <span>&gt;&nbsp;</span>}
                                        {entry.label}
                                    </div>
                                </li>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
        // <div
        //     className="h-full block relative"
        //     onBlur={() => setExpanded(false)}
        //     onKeyDown={(event) => {
        //         if (event.key == 'KeyDown') {
        //             setActive(active + 1);
        //         }
        //     }}
        //     role="tablist"
        // >
        //     <button
        //         className="flex items-center w-fit h-full border-r border-neutral-700 pl-4 pr-4 cursor-pointer hover:bg-neutral-800"
        //         type="button"
        //         id="dropdownMenuButton"
        //         data-toggle="dropdown"
        //         aria-haspopup="true"
        //         aria-expanded={expanded}
        //         onClick={() => setExpanded(!expanded)}
        //     >
        //         {list[active].icon}
        //         <span>{list[active].label}</span>
        //     </button>
        //     {expanded && (
        //         <ul
        //             className={cx(
        //                 'absolute top-full w-fit left-0 min-w-full border border-neutral-700 max-h-96 overflow-y-auto',
        //                 expanded ? 'block' : 'none'
        //             )}
        //             aria-labelledby="dropdownMenuButton"
        //             tabIndex={-1}
        //         >
        //             {list.map((v) => (
        //                 <li
        //                     key={v.label}
        //                     className="w-auto bg-black-800 hover:bg-neutral-800"
        //                 >
        //                     <a
        //                         className="px-4 py-2 min-w-full whitespace-nowrap block"
        //                         href={v.link}
        //                     >
        //                         {v.label}
        //                     </a>
        //                 </li>
        //             ))}
        //         </ul>
        //     )}
        // </div>
    );
};
