export interface Site {
  id?: number;
  name: string;
  address: string;
  city: string;
  country: string;
  surfaceArea: number;
  parkingSpaces?: number;
  energyConsumption?: number;
  employeeCount?: number;
  workstationCount?: number;
  materials?: SiteMaterial[];
  carbonResult?: CarbonResult;
}

export interface SiteMaterial {
  id?: number;
  materialType: string;
  quantity: number;
  emission?: number;
}

export interface CarbonResult {
  id?: number;
  totalCo2: number;
  constructionCo2: number;
  exploitationCo2: number;
  co2PerSquareMeter: number;
  co2PerEmployee: number;
  materialBreakdown?: MaterialBreakdown[];
  calculatedAt?: string;
}

export interface MaterialBreakdown {
  materialType: string;
  emission: number;
  percentage: number;
}

export interface SiteHistory {
  year: number;
  totalCo2: number;
  constructionCo2: number;
  exploitationCo2: number;
}

export interface CompareRequest {
  siteIds: number[];
}

export interface CompareResult {
  siteId: number;
  siteName: string;
  totalCo2: number;
  constructionCo2: number;
  exploitationCo2: number;
  co2PerSquareMeter: number;
  co2PerEmployee: number;
  surfaceArea: number;
  employeeCount: number;
}
