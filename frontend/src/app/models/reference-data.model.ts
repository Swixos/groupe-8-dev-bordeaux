export interface ReferenceData {
  id: number;
  key: string;
  value: number;
  unit: string;
  category: string;
  label: string;
  description?: string;
}

export interface ReferenceCategory {
  key: string;
  label: string;
  items: ReferenceData[];
}
