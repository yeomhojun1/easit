import { CanActivate, ExecutionContext, ServiceUnavailableException, Type, mixin } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { isProviderConfigured, OAUTH_PROVIDERS } from './auth.config'

// 전략이 등록되지 않은 소셜 로그인은 passport 의 "Unknown strategy" 500 대신
// 503 + 설명 JSON 으로 응답한다.
export function OAuthGuard(provider: string): Type<CanActivate> {
  class ConditionalOAuthGuard extends AuthGuard(provider) {
    canActivate(context: ExecutionContext) {
      if (!isProviderConfigured(provider)) {
        const info = OAUTH_PROVIDERS.find((p) => p.name === provider)
        throw new ServiceUnavailableException({
          provider,
          configured: false,
          message: `${info?.label ?? provider} 로그인은 이 서버에 설정되어 있지 않습니다. (.env 의 ${info?.envKeys.join(', ')} 필요)`,
        })
      }
      return super.canActivate(context)
    }
  }
  return mixin(ConditionalOAuthGuard)
}
