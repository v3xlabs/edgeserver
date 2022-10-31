import { UseFormRegister } from 'react-hook-form';

export const registerOrEmpty = (
    register: UseFormRegister<any> | undefined,
    id: string
) => {
    return register ? register(id) : [];
};
