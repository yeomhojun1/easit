import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string

  @IsOptional()
  @IsString()
  phone?: string

  // YYMMDD 6자리 (연령 확인용)
  @IsOptional()
  @Matches(/^\d{6}$/, { message: '생년월일은 YYMMDD 6자리여야 합니다.' })
  birthDate?: string

  @IsOptional()
  @IsIn(['male', 'female'], { message: '성별은 male 또는 female 이어야 합니다.' })
  gender?: string
}
