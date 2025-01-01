import { LoginFacade } from '@/components/LoginFacade';

import { App } from './App';

export const Document = () => {
    return (
        <div className="text-black-800 min-h-screen w-full dark:text-white">
            <LoginFacade>
                <App />
            </LoginFacade>
        </div>
    );
};
