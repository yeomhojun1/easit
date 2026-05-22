import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SubwayService {
  constructor(private config: ConfigService) {}

  // 실시간 열차 위치 (서울 열린데이터광장 API)
  async getRealtimePosition(lineId: string) {
    const key = this.config.get('SEOUL_API_KEY')
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimePosition/0/100/${lineId}`
    const res = await fetch(url)
    const data = await res.json() as any
    return data.realtimePositionList ?? []
  }

  // 실시간 혼잡도 (TAGO API)
  async getCongestion(stationId: string) {
    const key = this.config.get('TAGO_API_KEY')
    const url = `https://apis.data.go.kr/1613000/SubwayInfoService/getSubwaySttnAcctoRaiReviseInfoList?serviceKey=${key}&subwayStationId=${stationId}&_type=json`
    const res = await fetch(url)
    const data = await res.json() as any
    return data.response?.body?.items?.item ?? []
  }

  // 도착 정보
  async getArrivalInfo(stationName: string) {
    const key = this.config.get('SEOUL_API_KEY')
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/50/${encodeURIComponent(stationName)}`
    const res = await fetch(url)
    const data = await res.json() as any
    return data.realtimeArrivalList ?? []
  }
}
