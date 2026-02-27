export interface ExtractedScholarshipData {
    title: string;
    description: string;
    amount: string;
    deadline: string | null;
    fundType: string | null;
    degreeLevels: string[];
    requirements?: string | null;
    intakeSeason?: string | null;
    country?: string | null;
}

export interface ScrapedPageContent {
    url: string;
    title: string;
    text: string;
    links: string[];
}

export interface MatchedScholarship {
    id: number;
    title: string;
    description: string | null;
    amount: string | null;
    deadline: Date | null;
    fundType: string | null;
    degreeLevels: string[];
    country: string | null;
    originalUrl: string;
    match_score: number;
}
