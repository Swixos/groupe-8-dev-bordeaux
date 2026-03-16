import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonRecord } from './carbon-record.entity';
import { SiteService } from '../site/site.service';
import { MaterialType } from '../site/site-material.entity';

export interface MaterialInfo {
  type: MaterialType;
  label: string;
  factor: number;
  unit: string;
}

@Injectable()
export class CarbonService {
  // ADEME-based emission factors in kgCO2e/kg
  private readonly materialFactors: Record<MaterialType, number> = {
    [MaterialType.BETON]: 0.13,
    [MaterialType.ACIER]: 1.37,
    [MaterialType.VERRE]: 0.85,
    [MaterialType.BOIS]: 0.04,
    [MaterialType.ALUMINIUM]: 6.73,
    [MaterialType.CUIVRE]: 3.81,
    [MaterialType.PLASTIQUE]: 2.2,
    [MaterialType.LAINE_VERRE]: 1.54,
    [MaterialType.BRIQUE]: 0.23,
  };

  private readonly materialLabels: Record<MaterialType, string> = {
    [MaterialType.BETON]: 'Béton',
    [MaterialType.ACIER]: 'Acier',
    [MaterialType.VERRE]: 'Verre',
    [MaterialType.BOIS]: 'Bois',
    [MaterialType.ALUMINIUM]: 'Aluminium',
    [MaterialType.CUIVRE]: 'Cuivre',
    [MaterialType.PLASTIQUE]: 'Plastique',
    [MaterialType.LAINE_VERRE]: 'Laine de verre',
    [MaterialType.BRIQUE]: 'Brique',
  };

  // Energy factor: 51 kgCO2e/MWh (France electricity mix - ADEME)
  private readonly energyFactor = 51;

  // Parking: 500 kgCO2e/space/year
  private readonly parkingFactor = 500;

  // Workstation: 156 kgCO2e/workstation/year
  private readonly workstationFactor = 156;

  constructor(
    @InjectRepository(CarbonRecord)
    private readonly carbonRecordRepository: Repository<CarbonRecord>,
    private readonly siteService: SiteService,
  ) {}

  getMaterials(): MaterialInfo[] {
    return Object.values(MaterialType).map((type) => ({
      type,
      label: this.materialLabels[type],
      factor: this.materialFactors[type],
      unit: 'kgCO2e/kg',
    }));
  }

  async calculate(siteId: number): Promise<CarbonRecord> {
    const site = await this.siteService.findOne(siteId);

    // Construction emissions: sum(material_qty_tonnes * 1000 * factor)
    let constructionEmissions = 0;
    if (site.materials && site.materials.length > 0) {
      for (const material of site.materials) {
        const factor = this.materialFactors[material.materialType] || 0;
        // quantity is in tonnes, convert to kg (* 1000), then multiply by factor (kgCO2e/kg)
        constructionEmissions += material.quantity * 1000 * factor;
      }
    }

    // Exploitation emissions (annual)
    const energyEmissions = site.energyConsumption * this.energyFactor;
    const parkingEmissions = site.parkingSpaces * this.parkingFactor;
    const workstationEmissions = site.workstationCount * this.workstationFactor;
    const exploitationEmissions =
      energyEmissions + parkingEmissions + workstationEmissions;

    const totalEmissions = constructionEmissions + exploitationEmissions;

    const emissionsPerSqm =
      site.surfaceArea > 0 ? totalEmissions / site.surfaceArea : 0;
    const emissionsPerEmployee =
      site.employeeCount > 0 ? totalEmissions / site.employeeCount : 0;

    const currentYear = new Date().getFullYear();

    const record = this.carbonRecordRepository.create({
      constructionEmissions: Math.round(constructionEmissions * 100) / 100,
      exploitationEmissions: Math.round(exploitationEmissions * 100) / 100,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      emissionsPerSqm: Math.round(emissionsPerSqm * 100) / 100,
      emissionsPerEmployee: Math.round(emissionsPerEmployee * 100) / 100,
      year: currentYear,
      siteId,
    });

    return this.carbonRecordRepository.save(record);
  }

  async getHistory(siteId: number): Promise<CarbonRecord[]> {
    // Ensure site exists
    await this.siteService.findOne(siteId);

    return this.carbonRecordRepository.find({
      where: { siteId },
      order: { calculatedAt: 'DESC' },
    });
  }
}
