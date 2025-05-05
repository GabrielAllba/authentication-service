import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
