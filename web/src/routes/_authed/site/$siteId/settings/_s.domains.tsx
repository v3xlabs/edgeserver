import { createFileRoute } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import {
    LuAsterisk,
    LuCalendar,
    LuChevronDown,
    LuChevronUp,
    LuGlobe,
    LuLoader2,
} from 'react-icons/lu';

import {
    DomainSubmission,
    useSiteDomainCreate,
    useSiteDomainDelete,
    useSiteDomains,
} from '@/api';
import { Input } from '@/components';
import { ConfirmModal } from '@/components/alert-dialog/ConfirmModal';
import { Button } from '@/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/collapsible';
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
                        <DomainPreview domain={domain} siteId={siteId} />
                    </div>
                ))}
                {domains?.length === 0 && (
                    <div className="text-muted card space-y-2">
                        <p>
                            This site does not have any domains associated with
                            it yet, add one by clicking the button above.
                        </p>
                        <p>
                            You can either add a direct domain like
                            <pre className="bg-muted inline rounded-md border p-1">
                                mysite.example.com
                            </pre>{' '}
                            or a wildcard domain like
                            <pre className="bg-muted inline rounded-md border p-1">
                                *.example.com
                            </pre>
                            .
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export const DomainPreview: FC<{
    domain: DomainSubmission;
    siteId: string;
}> = ({ domain, siteId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isPending = 'status' in domain && domain.status === 'pending';
    const { mutate: deleteDomain, isSuccess } = useSiteDomainDelete();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <div className="card no-padding w-full space-y-1 p-2">
                <CollapsibleTrigger asChild>
                    <div className="hover:bg-muted flex cursor-pointer items-center justify-between gap-2 rounded-md p-2">
                        <div className="flex items-center gap-2">
                            <LuGlobe />
                            <div className="truncate">{domain.domain}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {domain.domain.startsWith('*.') && (
                                <div className="flex items-center gap-0.5 rounded-full border border-purple-500 bg-purple-200 py-0.5 pl-1 pr-2 text-xs font-bold text-purple-500">
                                    <LuAsterisk className="rotate-[30deg]" />
                                    Wildcard
                                </div>
                            )}
                            {isPending ? (
                                <div className="bg-accent flex items-center gap-1 rounded-full px-2 py-0.5 pl-3 text-sm text-white">
                                    Pending DNS update{' '}
                                    <LuLoader2 className="animate-spin" />
                                </div>
                            ) : (
                                <div className="text-muted">active</div>
                            )}
                            {isOpen ? <LuChevronUp /> : <LuChevronDown />}
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="relative w-full">
                    <div className="space-y-2 p-2 pt-1">
                        {isPending ? (
                            <div className="w-full space-y-2 rounded-md border p-4">
                                <div className="font-bold">
                                    Pending DNS verification
                                </div>
                                <p className="break-words">
                                    This domain is already in use on another
                                    site. You will need to verify ownership by
                                    settings a TXT record in the DNS settings of
                                    your domain registrar.
                                </p>
                                <div>
                                    <code>
                                        <pre className="bg-muted whitespace-pre-wrap break-words rounded-md p-4 text-sm">
                                            {/* @ts-ignore */}
                                            {`_edgeserver-challenge.${domain.domain} IN TXT ${domain.challenge}`}
                                        </pre>
                                    </code>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-2 rounded-md border p-4">
                                <div className="font-bold">
                                    Domain Information
                                </div>
                                <div className="flex items-center gap-2">
                                    <LuCalendar />
                                    <span>
                                        Last Updated:{' '}
                                        {domain.created_at
                                            ? format(
                                                  parseISO(domain.created_at),
                                                  'PPP'
                                              )
                                            : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <ConfirmModal
                                title="Delete Domain"
                                description="Are you sure you want to delete this domain?"
                                onConfirm={async () => {
                                    await deleteDomain({
                                        site_id: siteId,
                                        domain: domain.domain,
                                    });
                                }}
                            >
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </ConfirmModal>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
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
