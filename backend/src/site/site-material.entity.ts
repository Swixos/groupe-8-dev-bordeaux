import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';

export enum MaterialType {
  BETON = 'BETON',
  ACIER = 'ACIER',
  VERRE = 'VERRE',
  BOIS = 'BOIS',
  ALUMINIUM = 'ALUMINIUM',
  CUIVRE = 'CUIVRE',
  PLASTIQUE = 'PLASTIQUE',
  LAINE_VERRE = 'LAINE_VERRE',
  BRIQUE = 'BRIQUE',
}

@Entity('site_materials')
export class SiteMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  materialType: MaterialType;

  @Column({ type: 'float', default: 0 })
  quantity: number;

  @ManyToOne(() => Site, (site) => site.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @Column()
  siteId: number;
}
