import { Module } from '@nestjs/common'
import { SubwayService } from './subway.service'
import { SubwayController } from './subway.controller'
import { PredictionController } from './prediction.controller'

@Module({
  providers: [SubwayService],
  controllers: [SubwayController, PredictionController],
})
export class SubwayModule {}
