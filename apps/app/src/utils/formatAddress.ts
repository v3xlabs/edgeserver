export const formatAddress = (address: string) => {
    if (address.length < 42) {
        return address;
    }

    let shortened: string = address.slice(0, 4);

    shortened += '...';
    shortened += address.slice(-4);

    return shortened;
};
