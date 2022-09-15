import { Listbox } from '@headlessui/react';
import { cx } from '@utils/cx';
import { FC } from 'react';
import { useNetwork } from 'wagmi';

const CHAIN_IMG: Record<number, string> = {
    1: '/assets/chains/1.png',
    137: '/assets/chains/137.svg',
    10: '/assets/chains/10.svg',
    42_161: '/assets/chains/42161.svg',
};

export const ChainSwap: FC = () => {
    const { activeChain, chains, switchNetwork } = useNetwork();

    if (!activeChain || !switchNetwork) return <></>;

    return (
        <Listbox
            value={activeChain.id}
            onChange={() => {}}
            as="div"
            className="border-l min-w-fit border-neutral-300 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
            <Listbox.Button as="div" className="h-full">
                <div className="h-full flex gap-2 items-center px-4">
                    <img
                        src={CHAIN_IMG[activeChain.id] as string}
                        alt={activeChain.name}
                        className="h-6"
                    />
                    <span className="hidden 2xl:block">{activeChain.name}</span>
                </div>
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
                {chains.map((chain, index) => (
                    <Listbox.Option value="1" className="list-none" key={index}>
                        <button
                            className={cx(
                                'flex gap-2 p-2 pl-4 py-4 w-full block text-start hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                (chain.id == activeChain.id &&
                                    'border-l-4 border-blue-500') ||
                                    ''
                            )}
                            onClick={() => switchNetwork(chain.id)}
                        >
                            <img
                                src={CHAIN_IMG[chain.id] as string}
                                alt={activeChain.id}
                                className="w-6"
                            />
                            {chain.name}
                        </button>
                    </Listbox.Option>
                ))}
            </Listbox.Options>
        </Listbox>
    );
};
