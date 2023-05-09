import { DB } from '../../../../database/index.js';
import { verifyDNS } from './_dns.js';
import { traverseDomainOwnership } from './_ownership.js';

type DomainCreateState = {
    success: boolean;
    dns_passed?: boolean;
    domain_available?: boolean | string;
};

export const calculateDomainCreateState = async (
    domain: string,
    user: string
): Promise<DomainCreateState> => {
    const domainExists = await DB.selectOneFrom(
        'domains_by_site_id' as 'domains',
        ['site_id'],
        {
            domain,
        }
    );

    const canClaimDomainByOwnershipRules = await traverseDomainOwnership(
        domain,
        user
    );

    const shouldDNS = !canClaimDomainByOwnershipRules || domainExists;
    const canDNS = shouldDNS ? await verifyDNS(domain, user) : true;

    return {
        success: canClaimDomainByOwnershipRules && canDNS,
        dns_passed: shouldDNS ? canDNS : undefined,
        domain_available: !domainExists || domainExists.site_id.toString(),
    };
};
