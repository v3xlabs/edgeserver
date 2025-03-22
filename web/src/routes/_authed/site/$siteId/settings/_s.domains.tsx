import { createFileRoute } from '@tanstack/react-router';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { LuGlobe, LuLoader2 } from 'react-icons/lu';

import { DomainSubmission, useSiteDomainCreate, useSiteDomains } from '@/api';
import { Input } from '@/components';
import { Button } from '@/components/button';
import {
    ModalContent,
    ModalDescription,
    ModalTitle,
    ModalTrigger,
} from '@/components/modal';
import { ModalRoot } from '@/components/modal';

export const Route = createFileRoute(
    '/_authed/site/$siteId/settings/_s/domains'
)({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Domains',
            suffix: (
                <SiteDomainCreateModal site_id={context.params.siteId}>
                    <Button>Add Domain</Button>
                </SiteDomainCreateModal>
            ),
        };
    },
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: domains } = useSiteDomains(siteId);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                {domains?.map((domain) => (
                    <div key={domain.domain}>
                        <DomainPreview domain={domain} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const DomainPreview: FC<{ domain: DomainSubmission }> = ({ domain }) => {
    if ((domain as any)['status'] === 'pending') {
        return (
            <div className="card no-padding space-y-1 p-2">
                <div className="hover:bg-muted flex cursor-pointer items-center justify-between gap-2 rounded-md p-2">
                    <div className="flex items-center gap-2">
                        <LuGlobe />
                        <div>{domain.domain}</div>
                    </div>
                    <div className="bg-accent flex items-center gap-1 rounded-full px-2 py-0.5 text-sm text-white">
                        Pending DNS update{' '}
                        <LuLoader2 className="animate-spin" />
                    </div>
                </div>
                <div className="p-2 pt-1">
                    <div className="w-full space-y-2 rounded-md border p-4">
                        <div className="font-bold">
                            Pending DNS verification
                        </div>
                        <p>
                            This domain is already in use on another site. You
                            will need to verify ownership by settings a TXT
                            record in the DNS settings of your domain registrar.
                        </p>
                        <div>
                            <code>
                                <pre className="bg-muted rounded-md p-4">
                                    {/* @ts-ignore */}
                                    {`_edgeserver-challenge.${domain.domain} IN TXT ${domain.challenge}`}
                                </pre>
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card hover:bg-muted flex cursor-pointer items-center justify-between gap-2 space-y-2 rounded-md">
            <div className="flex items-center gap-2">
                <LuGlobe />
                <div>{domain.domain}</div>
            </div>
            <div className="text-muted-foreground">{/*Verified*/}</div>
        </div>
    );
};

export const SiteDomainCreateModal: FC<
    PropsWithChildren<{ site_id: string }>
> = ({ site_id, children }) => {
    const [domain, setDomain] = useState('');
    const [open, setOpen] = useState(false);
    const { mutate: createDomain, isSuccess, reset } = useSiteDomainCreate();

    useEffect(() => {
        if (isSuccess) {
            setOpen(false);
            setDomain('');
            reset();
        }
    }, [isSuccess]);

    const handleSubmit = () => {
        createDomain({ site_id, domain });
    };

    return (
        <ModalRoot open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
                <Button>Add Domain</Button>
            </ModalTrigger>
            <ModalContent>
                <ModalTitle>Add Domain</ModalTitle>
                <ModalDescription>
                    Add a new domain to your site.
                </ModalDescription>
                <Input
                    placeholder="example.com"
                    value={domain}
                    onChange={(event_) => setDomain(event_.target.value)}
                />
                <Button onClick={() => handleSubmit()}>Add Domain</Button>
            </ModalContent>
        </ModalRoot>
    );
};
