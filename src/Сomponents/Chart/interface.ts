export interface Variation {
    id?: number;
    name: string;
}

export interface DataItem {
    date: string;
    visits: Record<string, number | undefined>;
    conversions: Record<string, number | undefined>;
}