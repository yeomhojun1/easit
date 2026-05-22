import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(dto: {
    name: string; email: string; password: string
    phone: string; birthDate: string; gender: string
  }) {
    const user = await this.users.createEmailUser(dto)
    return this.issueToken(user)
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email)
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.')
    return this.issueToken(user)
  }

  async oauthLogin(profile: { provider: string; providerId: string; name: string; email: string }) {
    let user = await this.users.findByProvider(profile.provider, profile.providerId)
    if (!user) {
      user = await this.users.createOAuthUser(profile)
    }
    return this.issueToken(user)
  }

  private issueToken(user: any) {
    const payload = { sub: user.id, email: user.email }
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, points: user.points },
    }
  }
}
