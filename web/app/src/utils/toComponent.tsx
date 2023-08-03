/* eslint-disable react/display-name */
import { FC } from 'react';

export type DataFromComponent<T> = T extends FC<{ data: infer O }> ? O : never;

export const toComponent =
    <C, O = DataFromComponent<C>>(Component: C) =>
    (object: O, index: number) =>
        (
            // @ts-ignore
            <Component data={object} key={index} />
        );
