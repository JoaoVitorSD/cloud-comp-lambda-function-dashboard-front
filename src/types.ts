export interface Box{
    name: string;
    description: string;
    value: number|null;
}

export interface RedisData{
    cached_percent: number;
    outgoing_traffic: number;
    cpus_stats: number[];
}