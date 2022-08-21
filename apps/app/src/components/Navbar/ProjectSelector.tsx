import { FC, useRef, useState } from 'react';

const projects: {
    name: string;
    // Create 10 projects
}[] = [
    { name: 'Project 1' },
    { name: 'Project 2' },
    { name: 'Project 3' },
    { name: 'Project 4' },
    { name: 'Project 5' },
    { name: 'Project 6' },
    { name: 'Project 7' },
    { name: 'Project 8' },
    { name: 'Project 9' },
    { name: 'Project 10' },
];

export const ProjectSelector: FC = () => {
    const [open, setOpen] = useState(false);
    const [project, setProject] = useState('');
    // use ref
    const reference = useRef<HTMLButtonElement>(null);

    return (
        <button
            onFocus={() => setOpen(true)}
            onBlur={(variable) => {
                if (!reference.current) return;

                if (!reference.current.contains(variable.relatedTarget))
                    setOpen(false);
            }}
            className="
                dark:bg-black-700
                w-48 py-4 px-5 max-h-10
                text-left
                relative
                rounded-xl
                flex items-center
                transition-transform
                hover:scale-105"
            ref={reference}
        >
            {project == '' ? 'Select Project' : project}
            {open && (
                <ul
                    className="absolute top-14 left-0
                    dark:bg-neutral-800 
                    bg-white border-2 border-neutral-700
                    rounded-lg shadow-lg
                    px-4
                    flex flex-col gap-2"
                >
                    {projects.map((project) => {
                        const projectClicker = () => {
                            setProject(project.name);
                            setOpen(false);
                        };

                        return (
                            <div
                                onClick={projectClicker}
                                onKeyDown={projectClicker}
                                role="button"
                                className="rounded-md"
                                key={project.name}
                                tabIndex={0}
                            >
                                {project.name}
                            </div>
                        );
                    })}
                </ul>
            )}
        </button>
    );
};
