import { FC } from 'react';
import { Route, Routes } from 'react-router';

import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages';
import { Projects } from './pages/projects';

export const App: FC = () => {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="projects" element={<Projects />} />
            </Routes>
        </div>
    );
};
