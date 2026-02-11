import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+211[0-9]{9}$/, { message: 'Phone number must start with +211 and have 9 digits (South Sudan)' })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'PIN must be at least 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  pin!: string;
}

export class UpdateProfileImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4_000_000, { message: 'Image payload is too large' })
  imageData!: string;
}
