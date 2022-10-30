type DataOutput = {
    CASSANDRA_CONTACTPOINTS: string[];
    CASSANDRA_DATACENTER: string;
    CASSANDRA_KEYSPACE: string;
};

type Env<K> = { [key: keyof K]: string };

export const CASSANDRA: Env<DataOutput> = {};
