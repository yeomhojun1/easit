import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SubwayModule } from './subway/subway.module'
import { User } from './users/user.entity'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'easit'),
        password: config.get('DB_PASS', 'easit1234'),
        database: config.get('DB_NAME', 'easit'),
        entities: [User],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    SubwayModule,
  ],
})
export class AppModule {}
