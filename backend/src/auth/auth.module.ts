import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { KakaoStrategy } from './strategies/kakao.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { NaverStrategy } from './strategies/naver.strategy'
import { isProviderConfigured, jwtSecret } from './auth.config'

// 환경변수가 채워진 소셜 로그인만 프로바이더로 등록한다 (키가 없으면 부팅 자체가 실패하던 문제).
const oauthStrategies = [
  { name: 'kakao', strategy: KakaoStrategy },
  { name: 'naver', strategy: NaverStrategy },
  { name: 'google', strategy: GoogleStrategy },
]
  .filter((s) => isProviderConfigured(s.name))
  .map((s) => s.strategy)

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        secret: jwtSecret(),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, ...oauthStrategies],
  controllers: [AuthController],
})
export class AuthModule {}
