import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-naver-v2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('NAVER_CLIENT_ID'),
      clientSecret: config.get('NAVER_CLIENT_SECRET'),
      callbackURL: config.get('NAVER_CALLBACK_URL'),
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return {
      provider: 'naver',
      providerId: profile.id,
      name: profile.displayName,
      email: profile.email,
    }
  }
}
