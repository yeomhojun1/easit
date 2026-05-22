import { Module } from '@nestjs/common'
import { SubwayService } from './subway.service'
import { SubwayController } from './subway.controller'

@Module({
  providers: [SubwayService],
  controllers: [SubwayController],
})
export class SubwayModule {}
