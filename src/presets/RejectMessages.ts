import PackageInfo from '../../package.json';
import { RejectReason } from '../lookup/NextHandler';

export const VersionFooter = `IPFS-Signal v${PackageInfo.version}`;

export const DomainNotFound: (url: string) => RejectReason = (url: string) => ({
    status: 404,
    text: `Domain ${url} not found`,
});
export const FileNotFound: (url: string) => RejectReason = (url: string) => ({
    status: 404,
    text: `File ${url} not found`,
});
export const EmptyDirectory: (url: string) => RejectReason = (url: string) => ({
    status: 404,
    text: `Directory ${url} not indexable`,
});
export const Unknown: (url: string) => RejectReason = (url: string) => ({
    status: 404,
    text: `${url} not found`,
});
export const NoPermission: () => RejectReason = () => ({
    status: 403,
    text: 'Forbidden',
});
export const Malformat: () => RejectReason = () => ({
    status: 500,
    text: 'Invalid Payload',
});
