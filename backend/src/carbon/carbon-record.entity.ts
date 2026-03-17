import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from '../site/site.entity';

@Entity('carbon_records')
export class CarbonRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0 })
  constructionEmissions: number;

  @Column({ type: 'float', default: 0 })
  exploitationEmissions: number;

  @Column({ type: 'float', default: 0 })
  totalEmissions: number;

  @Column({ type: 'float', default: 0 })
  emissionsPerSqm: number;

  @Column({ type: 'float', default: 0 })
  emissionsPerEmployee: number;

  @Column({ type: 'int' })
  year: number;

  @CreateDateColumn()
  calculatedAt: Date;

  @ManyToOne(() => Site, (site) => site.carbonRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @Column()
  siteId: number;
}
