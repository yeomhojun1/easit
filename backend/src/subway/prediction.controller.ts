import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { predictSeat } from './seat-model'

// 공공데이터 기반 통계 예측이라 인증 없이 공개 (기존 /subway/*와 달리 JWT 불필요)
@Controller('subway')
export class PredictionController {
  @Get('seat-prediction')
  getSeatPrediction(
    @Query('line') line: string,
    @Query('station') station: string,
    @Query('next') next: string,
    @Query('day') day = '평일',
    @Query('time') time?: string,
    @Query('stops') stops = '8',
  ) {
    if (!line || !station || !next)
      throw new BadRequestException('line, station, next 쿼리가 필요합니다.')
    if (!time) {
      const now = new Date()
      time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    }
    if (!/^\d{1,2}:\d{2}$/.test(time)) throw new BadRequestException('time은 HH:MM 형식이어야 합니다.')
    return predictSeat(line, station, next, day, time, parseInt(stops, 10) || 8)
  }
}
