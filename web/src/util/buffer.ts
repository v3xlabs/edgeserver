export const buffercnvrt = (value: {
    type: 'Buffer';
    data: number[];
}): string | undefined => {
    // eslint-disable-next-line unicorn/no-null
    if (!value || typeof value !== 'object') return;

    return Buffer.from(value.data).toString('utf8').trim();
};
