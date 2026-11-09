import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { predictSeat } from './seat-model'

// 서울 시각 HH:MM — 서버 시간대(UTC 등)와 무관하게 Asia/Seoul 기준으로 계산한다
export function seoulTimeHHMM(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('hour')}:${get('minute')}`
}

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
    if (!time) time = seoulTimeHHMM()
    const hm = /^(\d{1,2}):(\d{2})$/.exec(time)
    if (!hm) throw new BadRequestException('time은 HH:MM 형식이어야 합니다.')
    const hour = Number(hm[1])
    const minute = Number(hm[2])
    if (hour > 23 || minute > 59) throw new BadRequestException('time은 00:00~23:59 범위여야 합니다.')
    return predictSeat(line, station, next, day, time, parseInt(stops, 10) || 8)
  }
}
