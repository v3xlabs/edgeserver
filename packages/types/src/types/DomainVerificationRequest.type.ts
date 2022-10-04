export type DomainVerificationRequest = {
    type: "ens" | "dns" | "";
    name: string;
    id: string;
};
