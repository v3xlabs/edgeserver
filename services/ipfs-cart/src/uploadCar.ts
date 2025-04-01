import config from "./config";

type IpfsClusterResponse = {
    name: string; // ""
    cid: string; // "bafy..."
    bytes: number; // 108925
    allocations: string[]; // ["12D3..."]
}

export const uploadCar = async (carFilePath: string) => {
    if (!config.ipfsCluster.url) {
        throw new Error("IPFS cluster URL is not set, cannot upload CAR file ::uploadCar.ts");
    }

    const url = `${config.ipfsCluster.url}/add?local=true&format=car`;

    const file = await Bun.file(carFilePath).arrayBuffer();
    const formData = new FormData();
    formData.append("file", new Blob([file]));

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const data = await response.json() as IpfsClusterResponse;

    console.log("IPFS response:", response);

    return data;
};
