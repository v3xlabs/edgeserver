import { log } from "@edgelabs/log";
import kleur from "kleur";

type ENVModule = {

};

export const CONFIG = {
    CASSANDRA: {
        name: "Cassandra",
        CASSANDRA_CONTACTPOINTS: {
            default: "0.0.0.0:9042",
        },
        CASSANDRA_DATACENTER: {
            default: "localdatacenter1",
        },
        CASSANDRA_KEYSPACE: {
            default: "system",
        },
    },
    REDIS: {
        name: "Redis",
        REDIS_IP: {
            default: "redis://0.0.0.0:6379",
        },
    },
};
//

export const parseENV = (config: ENVModule[]) => {
    const ENVIRONMENT = {};
    for (const conf of config) {
        for (const key of Object.keys(conf)) {
            if (key == "name") continue;

            if (!process.env[key]) {
                log.warning(`No ${key} found. Please supply one`);
                throw new Error("Missing " + key);
            } else {
                log.env(key + " " + kleur.green("✓"));
                ENVIRONMENT[key] = process.env[key];
            }
        }
    }

    console.log('\n');
    log.env(
        'Starting the system with the following configuration',
        ...Object.keys(ENVIRONMENT).map((key) => `${key} ${kleur.gray(ENVIRONMENT[key])}`)
    );
    console.log('\n');

    return ENVIRONMENT as Record<'CASSANDRA_CONTACTPOINTS' | 'CASSANDRA_DATACENTER' | 'CASSANDRA_KEYSPACE' | 'REDIS_IP', string>;
};
