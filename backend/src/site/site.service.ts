import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Site } from './site.entity';
import { SiteMaterial } from './site-material.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(SiteMaterial)
    private readonly materialRepository: Repository<SiteMaterial>,
  ) {}

  async create(createSiteDto: CreateSiteDto, userId: number): Promise<Site> {
    const { materials, ...siteData } = createSiteDto;

    const site = this.siteRepository.create({
      ...siteData,
      userId,
    });

    const savedSite = await this.siteRepository.save(site);

    if (materials && materials.length > 0) {
      const materialEntities = materials.map((m) =>
        this.materialRepository.create({
          materialType: m.materialType,
          quantity: m.quantity,
          siteId: savedSite.id,
        }),
      );
      await this.materialRepository.save(materialEntities);
    }

    return this.findOne(savedSite.id);
  }

  async findAll(): Promise<any[]> {
    const sites = await this.siteRepository.find({
      relations: ['materials', 'carbonRecords'],
    });
    return sites.map((s) => this.serialize(s));
  }

  async findOne(id: number): Promise<any> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: ['materials', 'carbonRecords'],
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    return this.serialize(site);
  }

  async findByUser(userId: number): Promise<any[]> {
    const sites = await this.siteRepository.find({
      where: { userId },
      relations: ['materials', 'carbonRecords'],
      order: { createdAt: 'DESC' },
    });
    return sites.map((s) => this.serialize(s));
  }

  async update(
    id: number,
    updateSiteDto: UpdateSiteDto,
    userId: number,
  ): Promise<Site> {
    const site = await this.findOne(id);

    if (site.userId !== userId) {
      throw new ForbiddenException('You can only update your own sites');
    }

    const { materials, ...siteData } = updateSiteDto;

    await this.siteRepository.update(id, siteData);

    if (materials !== undefined) {
      await this.materialRepository.delete({ siteId: id });

      if (materials.length > 0) {
        const materialEntities = materials.map((m) =>
          this.materialRepository.create({
            materialType: m.materialType,
            quantity: m.quantity,
            siteId: id,
          }),
        );
        await this.materialRepository.save(materialEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const site = await this.findOne(id);

    if (site.userId !== userId) {
      throw new ForbiddenException('You can only delete your own sites');
    }

    await this.siteRepository.remove(site);
  }

  private serialize(site: Site): any {
    return {
      id: site.id,
      name: site.name,
      address: site.address,
      city: site.city,
      country: site.country,
      surfaceArea: site.surfaceArea,
      parkingSpaces: site.parkingSpaces,
      energyConsumption: site.energyConsumption,
      employeeCount: site.employeeCount,
      workstationCount: site.workstationCount,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
      userId: site.userId,
      materials: (site.materials || []).map((m) => ({
        id: m.id,
        materialType: m.materialType,
        quantity: m.quantity,
        siteId: m.siteId,
      })),
      carbonRecords: (site.carbonRecords || []).map((r) => ({
        id: r.id,
        constructionEmissions: r.constructionEmissions,
        exploitationEmissions: r.exploitationEmissions,
        totalEmissions: r.totalEmissions,
        emissionsPerSqm: r.emissionsPerSqm,
        emissionsPerEmployee: r.emissionsPerEmployee,
        year: r.year,
        calculatedAt: r.calculatedAt,
        siteId: r.siteId,
      })),
    };
  }

  async compareSites(ids: number[]): Promise<any[]> {
    const sites = await this.siteRepository.find({
      where: { id: In(ids) },
      relations: ['materials', 'carbonRecords'],
    });

    if (sites.length === 0) {
      throw new NotFoundException('No sites found with the given IDs');
    }

    return sites.map((site) => {
      const latest = site.carbonRecords?.sort(
        (a, b) =>
          new Date(b.calculatedAt).getTime() -
          new Date(a.calculatedAt).getTime(),
      )[0];
      return {
        siteId: site.id,
        siteName: site.name,
        totalCo2: latest ? latest.totalEmissions / 1000 : 0,
        constructionCo2: latest ? latest.constructionEmissions / 1000 : 0,
        exploitationCo2: latest ? latest.exploitationEmissions / 1000 : 0,
        co2PerSquareMeter: latest?.emissionsPerSqm || 0,
        co2PerEmployee: latest?.emissionsPerEmployee || 0,
        surfaceArea: site.surfaceArea,
        employeeCount: site.employeeCount,
      };
    });
  }
}
