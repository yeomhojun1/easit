import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-kakao'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('KAKAO_REST_API_KEY'),
      callbackURL: config.get('KAKAO_CALLBACK_URL'),
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return {
      provider: 'kakao',
      providerId: String(profile.id),
      name: profile.displayName || profile.username,
      email: profile._json?.kakao_account?.email,
    }
  }
}
