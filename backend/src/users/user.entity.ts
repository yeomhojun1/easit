import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  name: string

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ nullable: true, select: false })
  password: string

  @Column({ nullable: true })
  phone: string

  // 주민번호 앞자리 = 생년월일 YYMMDD (연령 확인용)
  @Column({ nullable: true })
  birthDate: string

  @Column({ nullable: true })
  gender: string  // 'male' | 'female'

  @Column({ nullable: true })
  provider: string  // 'kakao' | 'naver' | 'google' | 'email'

  @Column({ nullable: true })
  providerId: string

  @Column({ default: 0 })
  points: number

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
