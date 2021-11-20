import { ScylloClient } from "scyllo";
import { EdgeName } from "./types/EdgeName";
import { config } from 'dotenv';

config();
const DB = new ScylloClient<{
    edgenames: EdgeName
}>({
    client: {
        contactPoints: [process.env.DB_IP]
    }
});