import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reference_data')
export class ReferenceData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'float' })
  value: number;

  @Column()
  unit: string;

  @Column()
  category: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;
}
