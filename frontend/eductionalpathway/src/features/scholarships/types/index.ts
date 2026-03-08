export interface Scholarship {
  id: number;
  title: string;
  description: string | null;
  amount: string | null;
  deadline: string | null;
  fundType: string | null;
  requirements: string | null;
  intakeSeason: string | null;
  country: string | null;
  originalUrl: string;
  degree_levels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipFilters {
  query?: string;
  country?: string;
  degree_level?: string;
  fund_type?: string;
}
