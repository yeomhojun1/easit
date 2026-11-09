import { ValidationPipe } from '@nestjs/common'

// 전역 ValidationPipe 설정 (main.ts 와 테스트가 같은 설정을 쓰도록 분리)
// whitelist + forbidNonWhitelisted: DTO 에 없는 필드(points, isActive, id 등)가 오면 400 으로 거절한다 — mass assignment 방지.
// 주의: whitelist 는 class-validator 데코레이터가 없는 속성도 "모르는 필드"로 보므로 DTO 의 모든 속성에 데코레이터를 달아야 한다.
export const VALIDATION_PIPE_OPTIONS = { transform: true, whitelist: true, forbidNonWhitelisted: true }

export const createValidationPipe = () => new ValidationPipe(VALIDATION_PIPE_OPTIONS)
