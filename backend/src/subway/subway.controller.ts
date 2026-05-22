import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SubwayService } from './subway.service'

@Controller('subway')
@UseGuards(AuthGuard('jwt'))
export class SubwayController {
  constructor(private subway: SubwayService) {}

  @Get('arrival')
  getArrival(@Query('station') station: string) {
    return this.subway.getArrivalInfo(station)
  }

  @Get('congestion')
  getCongestion(@Query('stationId') stationId: string) {
    return this.subway.getCongestion(stationId)
  }

  @Get('position')
  getPosition(@Query('lineId') lineId: string) {
    return this.subway.getRealtimePosition(lineId)
  }
}
