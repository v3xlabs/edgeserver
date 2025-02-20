import clsx from 'clsx';
import {
    FC,
    ReactNode,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FaArrowsUpDown } from 'react-icons/fa6';

import { Button } from '../button';
import * as Command from '../command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
export type FieldOption = {
    label: string | ReactNode;
    value: string;
    icon?: (_properties: { selected: boolean }) => ReactNode;
    group?: boolean;
    back?: boolean;
};

export type FieldSelectProperties = {
    value: string;
    onChange?: (_value: string) => boolean;
    onSearch?: (_search: string) => void;
    label?: string;
    options: FieldOption[];

    description?: ReactNode;
    errorMessage?: string;
    emptyMessage?: string;
    placeholder?: string;
    justifyBetween?: boolean;
    suffix?: ReactNode;
    popoverWidth?: string;
    searchFn?: (_search: string) => FieldOption[];
};

export const FieldSelect: FC<FieldSelectProperties> = ({
    value,
    onChange,
    options,
    description,
    errorMessage,
    emptyMessage,
    placeholder,
    onSearch,
    justifyBetween = false,
    suffix,
    searchFn,
    popoverWidth = '200px',
}) => {
    const [open, setOpen] = useState(false);
    const id = useId();

    // The scrollable element for your list
    const parentReference = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState('');

    const [nonce, setNonce] = useState(0);

    const filteredOptions = useMemo(() => {
        if (search == '') return options;

        if (searchFn) {
            return searchFn(search);
        }

        return options.filter((option) => {
            // Convert label to string if it's a ReactNode
            const labelString =
                typeof option.label === 'string' ? option.label : '';

            return labelString.toLowerCase().includes(search.toLowerCase());
        });
    }, [options, search, nonce]);

    const count = filteredOptions.length;

    useEffect(() => {
        onSearch?.(search);
    }, [search]);

    useEffect(() => {
        if (open) {
            const z = setTimeout(() => {
                setNonce(nonce + 1);
            }, 10);

            return () => clearTimeout(z);
        }
    }, [open]);

    return (
        <div className="block  max-w-full space-y-2">
            <div
                className={clsx(
                    'flex items-stretch justify-start gap-2'
                    // width === 'full' && 'w-full'
                )}
            >
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="default"
                            type="button"
                            role="combobox"
                            aria-expanded={open}
                            className="border-default w-full justify-between rounded-md border shadow-sm"
                        >
                            {value
                                ? options.find(
                                      (option) => option.value === value
                                  )?.label
                                : placeholder || 'Select an option...'}
                            <FaArrowsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="bg-default border-default rounded-md border p-0 shadow-lg"
                        style={{ width: popoverWidth }}
                        onWheel={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <Command.Root shouldFilter={false}>
                            <Command.Input
                                placeholder={placeholder}
                                value={search}
                                onValueChange={(value) => {
                                    setSearch(value);
                                }}
                                className="p-2"
                            />
                            <Command.List className="text-foreground">
                                {options.length === 0 && (
                                    <Command.Empty>
                                        {emptyMessage || 'No options found.'}
                                    </Command.Empty>
                                )}
                                <div
                                    ref={parentReference}
                                    className="w-full overflow-y-auto"
                                >
                                    <div className="w-full">
                                        {filteredOptions?.map((option) => (
                                            <Command.Item
                                                key={option.value}
                                                value={option.value}
                                                onSelect={(currentValue) => {
                                                    const result = onChange?.(
                                                        currentValue === value
                                                            ? ''
                                                            : currentValue
                                                    );

                                                    if (result) {
                                                        setOpen(false);
                                                    }
                                                }}
                                                className={clsx(
                                                    'm-2',
                                                    justifyBetween &&
                                                        'flex items-center justify-between',
                                                    value === option.value &&
                                                        'bg-selected'
                                                )}
                                            >
                                                {option.label}
                                                {option.icon &&
                                                    option.icon?.({
                                                        selected:
                                                            value ===
                                                            option.value,
                                                    })}
                                            </Command.Item>
                                        ))}
                                    </div>
                                </div>
                            </Command.List>
                        </Command.Root>
                    </PopoverContent>
                </Popover>
                {suffix}
            </div>
            {description && (
                <div className="text-sm text-gray-500">{description}</div>
            )}
            {errorMessage && (
                <div className="text-sm text-red-500">{errorMessage}</div>
            )}
        </div>
    );
};
