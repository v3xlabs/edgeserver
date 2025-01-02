import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useSiteCreate, useTeams } from '@/api';
import { Button, Input } from '@/components';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/_authed/site/new')({
    component: RouteComponent,
});

type FormData = {
    name: string;
    team_id: string;
};

function RouteComponent() {
    const { data: teams } = useTeams();
    const { mutateAsync: createSite } = useSiteCreate();
    const navigate = useNavigate();

    const { Field, Subscribe, handleSubmit } = useForm<FormData>({
        defaultValues: {
            name: '',
            team_id: teams?.[0]?.team_id ?? '',
        },
        onSubmit: async ({ value }) => {
            const site = await createSite({
                name: value.name,
                team_id: value.team_id,
            });

            navigate({
                to: '/site/$siteId',
                params: {
                    siteId: site.site_id,
                },
            });
        },
    });

    return (
        <SCPage title="Create Site">
            <form
                className="card space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSubmit();
                }}
            >
                <Field name="team_id">
                    {({ handleBlur, handleChange, state }) => (
                        <div>
                            <label htmlFor="team_id">Team</label>
                            <Input
                                onBlur={handleBlur}
                                onChange={(event) =>
                                    handleChange(event.target.value)
                                }
                                id="team_id"
                                value={state.value}
                            />
                        </div>
                    )}
                </Field>
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
                                Create Site
                            </Button>
                        )}
                    </Subscribe>
                </div>
            </form>
        </SCPage>
    );
}
