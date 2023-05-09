import { RoutingPolicy } from '../routing/policy';

export type DomainV1 = {
    // Domain formatted `hello.luc.computer`
    domain: string;
    // The site id that owns this domain
    site_id: string;
    // RoutingPolicy
    routing_policy?: RoutingPolicy;
    // RoutingConfig
    routing_config?: string;
};

export type Domain = DomainV1;
