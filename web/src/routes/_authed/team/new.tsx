import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useTeamCreate, useTeams } from '@/api';
import { Button, Input } from '@/components';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/_authed/team/new')({
    component: RouteComponent,
});

type FormData = {
    name: string;
};

function RouteComponent() {
    const { data: teams } = useTeams();
    const { mutateAsync: createTeam } = useTeamCreate();
    const navigate = useNavigate();

    const { Field, Subscribe, handleSubmit } = useForm<FormData>({
        defaultValues: {
            name: '',
        },
        onSubmit: async ({ value }) => {
            const team = await createTeam({
                name: value.name,
            });

            navigate({
                to: '/team/$teamId',
                params: {
                    teamId: team.team_id,
                },
            });
        },
    });

    return (
        <SCPage title="Create Team">
            <form
                className="card space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSubmit();
                }}
            >
                <Field name="name">
                    {({ handleBlur, handleChange, state }) => (
                        <div>
                            <label htmlFor="name">Name</label>
                            <Input
                                onBlur={handleBlur}
                                onChange={(event) =>
                                    handleChange(event.target.value)
                                }
                                id="name"
                                placeholder="My Cool Site"
                                value={state.value}
                            />
                        </div>
                    )}
                </Field>
                <div className="flex justify-end">
                    <Subscribe>
                        {({ canSubmit }) => (
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!canSubmit}
                            >
                                Create Team
                            </Button>
                        )}
                    </Subscribe>
                </div>
            </form>
        </SCPage>
    );
}
