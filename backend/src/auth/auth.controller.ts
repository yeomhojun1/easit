import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ── 이메일 회원가입
  @Post('register')
  register(@Body() body: {
    name: string; email: string; password: string
    phone: string; birthDate: string; gender: string
  }) {
    return this.auth.register(body)
  }

  // ── 이메일 로그인
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password)
  }

  // ── 카카오 OAuth
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${process.env.FRONTEND_URL}?token=${result.accessToken}`)
  }

  // ── 네이버 OAuth
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  naverLogin() {}

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${process.env.FRONTEND_URL}?token=${result.accessToken}`)
  }

  // ── 구글 OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.auth.oauthLogin(req.user)
    res.redirect(`${process.env.FRONTEND_URL}?token=${result.accessToken}`)
  }
}
