export const buffercnvrt = (value: {
    type: 'Buffer';
    data: number[];
}): string | null => {
    // eslint-disable-next-line unicorn/no-null
    if (!value || typeof value !== 'object') return null;

    return Buffer.from(value.data).toString('utf8').trim();
};
