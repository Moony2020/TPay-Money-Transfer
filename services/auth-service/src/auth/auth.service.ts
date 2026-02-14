import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly maxProfileImageSizeBytes = 2 * 1024 * 1024;
  private readonly allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    // 2. Hash PIN
    const hashedPin = await argon2.hash(dto.pin);

    // 3. Create User
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        hashedPin,
        fullName: dto.fullName,
      },
    });

    // 4. Create Wallet (Fire and forget or wait? For now, let's try to notify wallet service)
    try {
      // In a production app, this would be an event (RabbitMQ/Kafka)
      // For now, we use a direct HTTP call for simplicity in this sprint
      const walletServiceUrl = process.env.WALLET_SERVICE_URL || 'http://127.0.0.1:3002';
      await fetch(`${walletServiceUrl}/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currency: 'SSP' })
      });
    } catch (error) {
      console.error('Failed to create wallet for user:', user.id, error);
    }

    // 5. Return token
    return this.generateToken(
      user.id,
      user.phoneNumber,
      user.fullName ?? '',
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user || !(await argon2.verify(user.hashedPin, dto.pin))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(
      user.id,
      user.phoneNumber,
      user.fullName ?? '',
    );
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        kycTier: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName;
    }

    if (dto.profileImageUrl !== undefined) {
      if (dto.profileImageUrl) {
        this.validateProfileImage(dto.profileImageUrl);
      }
      data.profileImageUrl = dto.profileImageUrl;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        kycTier: true,
        profileImageUrl: true,
      },
    });

    return updatedUser;
  }

  async updateProfileImage(userId: string, imageData: string) {
    this.validateProfileImage(imageData);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageData },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        kycTier: true,
        profileImageUrl: true,
      },
    });

    return updatedUser;
  }

  async removeProfileImage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: null },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        kycTier: true,
        profileImageUrl: true,
      },
    });

    return updatedUser;
  }

  private validateProfileImage(imageData: string) {
    const matches = imageData.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/,
    );

    if (!matches) {
      throw new BadRequestException('Invalid image format');
    }

    const mimeType = matches[1].toLowerCase();
    const base64Payload = matches[2].replace(/\s/g, '');

    if (!this.allowedImageMimeTypes.has(mimeType)) {
      throw new BadRequestException('Unsupported image type');
    }

    const paddingMatches = base64Payload.match(/=+$/);
    const paddingLength = paddingMatches ? paddingMatches[0].length : 0;
    const sizeBytes = (base64Payload.length * 3) / 4 - paddingLength;

    if (sizeBytes > this.maxProfileImageSizeBytes) {
      throw new BadRequestException('Image exceeds 2 MB limit');
    }
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hashedPin: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await argon2.verify(user.hashedPin, pin);
    if (!isValid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    return { verified: true };
  }

  private async generateToken(
    userId: string,
    phoneNumber: string,
    fullName: string,
  ) {
    const payload = { sub: userId, phoneNumber, fullName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
