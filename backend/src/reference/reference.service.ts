import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferenceData } from './reference-data.entity';

@Injectable()
export class ReferenceService implements OnModuleInit {
  constructor(
    @InjectRepository(ReferenceData)
    private readonly repo: Repository<ReferenceData>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async findAll(): Promise<ReferenceData[]> {
    return this.repo.find({ order: { category: 'ASC', label: 'ASC' } });
  }

  async findByCategory(category: string): Promise<ReferenceData[]> {
    return this.repo.find({
      where: { category },
      order: { label: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<ReferenceData | null> {
    return this.repo.findOne({ where: { key } });
  }

  async create(data: Partial<ReferenceData>): Promise<ReferenceData> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<ReferenceData>): Promise<ReferenceData> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`ReferenceData #${id} not found`);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`ReferenceData #${id} not found`);
    await this.repo.remove(entity);
  }

  private async seed() {
    const count = await this.repo.count();
    if (count > 0) return;

    const data: Partial<ReferenceData>[] = [
      // Énergie
      {
        key: 'panneaux_photovoltaiques',
        value: 300,
        unit: 'kWh/m²/an',
        category: 'energie',
        label: 'Panneaux photovoltaïques',
        description: 'Production énergétique des panneaux solaires',
      },
      {
        key: 'eolienne_installation',
        value: 7000,
        unit: '€',
        category: 'energie',
        label: 'Éolienne (coût installation)',
        description: "Coût d'installation d'une éolienne",
      },
      {
        key: 'eolienne_production',
        value: 1,
        unit: 'kWh',
        category: 'energie',
        label: 'Éolienne (production)',
        description: "Production unitaire d'une éolienne",
      },
      {
        key: 'electricite_verte_abonnement',
        value: 20,
        unit: '€/mois',
        category: 'energie',
        label: 'Électricité verte (abonnement)',
        description: "Coût mensuel d'abonnement électricité verte",
      },
      {
        key: 'electricite_verte_kwh',
        value: 0.2,
        unit: '€/kWh',
        category: 'energie',
        label: 'Électricité verte (prix kWh)',
        description: 'Prix du kWh en électricité verte',
      },
      {
        key: 'co2_electricite_verte',
        value: 7,
        unit: 'g éqCO₂/kWh',
        category: 'energie',
        label: 'CO₂ électricité verte',
        description: 'Émissions de CO₂ par kWh en électricité verte',
      },

      // Ressources
      {
        key: 'prix_eau',
        value: 3,
        unit: '€/m³',
        category: 'ressources',
        label: 'Prix eau',
        description: "Prix du mètre cube d'eau",
      },

      // Matériaux
      {
        key: 'emission_beton',
        value: 250,
        unit: 'kg CO₂/m³',
        category: 'materiaux',
        label: 'Émission béton',
        description: 'Émissions CO₂ par mètre cube de béton',
      },
      {
        key: 'emission_bois',
        value: 40,
        unit: 'kg CO₂/tonne',
        category: 'materiaux',
        label: 'Émission bois',
        description: 'Émissions CO₂ par tonne de bois',
      },

      // Compensation
      {
        key: 'absorption_arbre',
        value: 25,
        unit: 'kg CO₂/an',
        category: 'compensation',
        label: 'Absorption arbre',
        description: "Quantité de CO₂ absorbée par un arbre par an",
      },
      {
        key: 'absorption_toit_vegetalise',
        value: 5,
        unit: 'kg CO₂/m²/an',
        category: 'compensation',
        label: 'Absorption toit végétalisé',
        description: 'Quantité de CO₂ absorbée par m² de toit végétalisé par an',
      },

      // Transport
      {
        key: 'consommation_voiture_20km',
        value: 5,
        unit: 'kg CO₂',
        category: 'transport',
        label: 'Consommation voiture (trajet 20 km)',
        description: 'Émissions CO₂ pour un trajet de 20 km en voiture',
      },
      {
        key: 'consommation_tram_par_km',
        value: 0.038,
        unit: 'kg CO₂/km/personne',
        category: 'transport',
        label: 'Consommation tram',
        description: 'Émissions CO₂ par km et par personne en tram (3.8 kg/km ÷ 100 personnes)',
      },

      // Numérique
      {
        key: 'fabrication_parc_informatique',
        value: 2000,
        unit: 'kg éqCO₂/an/personne',
        category: 'numerique',
        label: 'Fabrication parc informatique',
        description: 'Émissions liées à la fabrication du matériel informatique par personne et par an',
      },
      {
        key: 'consommation_pc_portable',
        value: 50,
        unit: 'kWh/an',
        category: 'numerique',
        label: 'Consommation PC portable',
        description: "Consommation électrique annuelle d'un PC portable",
      },
      {
        key: 'consommation_vm',
        value: 75,
        unit: 'kWh/an',
        category: 'numerique',
        label: 'Consommation VM',
        description: "Consommation électrique annuelle d'une machine virtuelle",
      },
      {
        key: 'consommation_photocopieur',
        value: 400,
        unit: 'kWh/an',
        category: 'numerique',
        label: 'Consommation photocopieur',
        description: "Consommation électrique annuelle d'un photocopieur",
      },
    ];

    await this.repo.save(data);
    console.log(`[ReferenceData] Seeded ${data.length} reference values`);
  }
}
