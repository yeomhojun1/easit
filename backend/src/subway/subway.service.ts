import { BadGatewayException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SubwayService {
  constructor(private config: ConfigService) {}

  // 외부 API 호출 공통 처리 — 네트워크 오류·비정상 응답·JSON 파싱 실패를 502 로 바꾼다.
  // (URL 에 인증키가 들어 있으므로 에러 메시지에는 URL 을 넣지 않는다)
  private async fetchJson(url: string, label: string): Promise<any> {
    let res: Response
    try {
      res = await fetch(url)
    } catch {
      throw new BadGatewayException(`${label} API 에 연결하지 못했습니다.`)
    }
    if (!res.ok) throw new BadGatewayException(`${label} API 응답 오류 (HTTP ${res.status})`)
    try {
      return await res.json()
    } catch {
      throw new BadGatewayException(`${label} API 응답을 해석하지 못했습니다.`)
    }
  }

  // 실시간 열차 위치 (서울 열린데이터광장 API)
  async getRealtimePosition(lineId: string) {
    const key = this.config.get('SEOUL_API_KEY')
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimePosition/0/100/${encodeURIComponent(lineId)}`
    const data = await this.fetchJson(url, '서울 실시간 열차 위치')
    return data.realtimePositionList ?? []
  }

  // 실시간 혼잡도 (TAGO API)
  async getCongestion(stationId: string) {
    const key = this.config.get('TAGO_API_KEY')
    const url = `https://apis.data.go.kr/1613000/SubwayInfoService/getSubwaySttnAcctoRaiReviseInfoList?serviceKey=${key}&subwayStationId=${encodeURIComponent(stationId)}&_type=json`
    const data = await this.fetchJson(url, 'TAGO 혼잡도')
    return data.response?.body?.items?.item ?? []
  }

  // 도착 정보
  async getArrivalInfo(stationName: string) {
    const key = this.config.get('SEOUL_API_KEY')
    const url = `http://swopenAPI.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/50/${encodeURIComponent(stationName)}`
    const data = await this.fetchJson(url, '서울 실시간 도착 정보')
    return data.realtimeArrivalList ?? []
  }
}
