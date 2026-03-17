import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { SiteMaterial } from './site-material.entity';
import { CarbonRecord } from '../carbon/carbon-record.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'float', default: 0 })
  surfaceArea: number;

  @Column({ type: 'int', default: 0 })
  parkingSpaces: number;

  @Column({ type: 'float', default: 0 })
  energyConsumption: number;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  workstationCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.sites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => SiteMaterial, (material) => material.site, {
    cascade: true,
  })
  materials: SiteMaterial[];

  @OneToMany(() => CarbonRecord, (record) => record.site)
  carbonRecords: CarbonRecord[];
}
