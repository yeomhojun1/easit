import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as session from 'express-session'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(session({
    secret: process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  }))

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`🚇 Easit 백엔드 실행 중: http://localhost:${port}/api`)
}

bootstrap()
