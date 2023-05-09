export type RoutingPolicy =
    | 'static' // Static routing policy (routing to a deploy (or latest)) (default)
    | 'redirect' // Redirect routing policy (redirect to a URL)
    | 'proxy' // Proxy routing policy (proxy to a URL) (not implemented)
    | 'maintenance'; // Maintenance routing policy (return 503)
