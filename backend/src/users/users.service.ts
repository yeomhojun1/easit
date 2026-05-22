import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, select: ['id', 'email', 'password', 'name', 'points', 'provider'] })
  }

  async findByProvider(provider: string, providerId: string) {
    return this.repo.findOne({ where: { provider, providerId } })
  }

  async createEmailUser(dto: { name: string; email: string; password: string; phone: string; birthDate: string; gender: string }) {
    const hashed = await bcrypt.hash(dto.password, 10)
    const user = this.repo.create({ ...dto, password: hashed, provider: 'email' })
    try {
      return await this.repo.save(user)
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('이미 사용 중인 이메일입니다.')
      }
      throw err
    }
  }

  async createOAuthUser(dto: { name: string; email: string; provider: string; providerId: string }) {
    const user = this.repo.create({ ...dto, points: 0 })
    return this.repo.save(user)
  }

  async addPoints(id: string, amount: number) {
    await this.repo.increment({ id }, 'points', amount)
    return this.findById(id)
  }
}
