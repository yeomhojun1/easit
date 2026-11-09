import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as session from 'express-session'
import * as passport from 'passport'
import { createValidationPipe } from './validation'
import { jwtSecret } from './auth/auth.config'

async function bootstrap() {
  // 운영(NODE_ENV=production)에서 JWT_SECRET 이 없으면 DB 연결 전에 바로 종료한다
  const secret = jwtSecret()
  const app = await NestFactory.create(AppModule)

  app.use(session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  app.useGlobalPipes(createValidationPipe())
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 4003
  await app.listen(port)
  console.log(`🚇 Easit 백엔드 실행 중: http://localhost:${port}/api`)
}

bootstrap()
