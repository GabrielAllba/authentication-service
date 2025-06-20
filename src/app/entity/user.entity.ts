import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  username: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isUserFirstTime: boolean;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpiresAt: Date | null;
}
