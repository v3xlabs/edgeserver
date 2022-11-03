import { ReactNode } from 'react';
import { UseFormRegister } from 'react-hook-form';

export interface BaseComponent {
    children?: ReactNode;
    className?: string;
}

export interface BaseRegisterComponent {
    /**
     *  Register from react-hook-form. Make sure to set the `id` property too.
     */
    register?: UseFormRegister<any>;
}

export interface BaseFormComponent
    extends BaseComponent,
        BaseRegisterComponent {}
