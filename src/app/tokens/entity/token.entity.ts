import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Token {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty()
  @Column({ type: 'text', unique: true })
  token: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
