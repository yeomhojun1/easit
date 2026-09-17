import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { OAuthGuard } from './oauth.guard'
import { enabledProviders, frontendUrl, OAUTH_PROVIDERS, isProviderConfigured } from './auth.config'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ── 사용 가능한 소셜 로그인 목록 (프론트가 버튼 노출 여부를 판단)
  @Get('providers')
  providers() {
    return {
      providers: enabledProviders().map((p) => ({ name: p.name, label: p.label })),
      all: OAUTH_PROVIDERS.map((p) => ({ name: p.name, label: p.label, configured: isProviderConfigured(p.name) })),
    }
  }

  // ── 이메일 회원가입
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body)
  }

  // ── 이메일 로그인
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password)
  }

  // ── 카카오 OAuth
  @Get('kakao')
  @UseGuards(OAuthGuard('kakao'))
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(OAuthGuard('kakao'))
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${frontendUrl()}?token=${result.accessToken}`)
  }

  // ── 네이버 OAuth
  @Get('naver')
  @UseGuards(OAuthGuard('naver'))
  naverLogin() {}

  @Get('naver/callback')
  @UseGuards(OAuthGuard('naver'))
  async naverCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${frontendUrl()}?token=${result.accessToken}`)
  }

  // ── 구글 OAuth
  @Get('google')
  @UseGuards(OAuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(OAuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${frontendUrl()}?token=${result.accessToken}`)
  }
}
