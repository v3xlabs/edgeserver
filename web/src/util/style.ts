import { cva } from 'class-variance-authority';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const cvax = <T>(...arguments_: Parameters<typeof cva<T>>) =>
    [cva(...arguments_), arguments_[1]!] as const;

/** No-op wrapper for tailwind classes for vscode intellisense */
export const tw = <T extends ClassValue>(input: T) => input;

export type BaseVariants = Record<string, Record<string, ClassValue>>;
