import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, UpdateProfileImageDto, UpdateProfileDto, VerifyPinDto, InternalVerifyPinDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@GetUser() user: { sub: string }) {
    console.log('>>> [AuthController] getProfile hit for userId:', user.sub);
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @GetUser() user: { sub: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/image')
  @HttpCode(HttpStatus.OK)
  updateProfileImage(
    @GetUser() user: { sub: string },
    @Body() dto: UpdateProfileImageDto,
  ) {
    return this.authService.updateProfileImage(user.sub, dto.imageData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/image')
  @HttpCode(HttpStatus.OK)
  removeProfileImage(@GetUser() user: { sub: string }) {
    return this.authService.removeProfileImage(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  verifyPin(
    @GetUser() user: { sub: string },
    @Body() dto: VerifyPinDto,
  ) {
    return this.authService.verifyPin(user.sub, dto.pin);
  }

  @Post('internal/verify-pin')
  @HttpCode(HttpStatus.OK)
  internalVerifyPin(@Body() dto: InternalVerifyPinDto) {
    return this.authService.verifyPin(dto.userId, dto.pin);
  }
}
