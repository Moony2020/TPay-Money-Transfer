import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('NotificationsGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      const phoneNumber = client.handshake.auth?.phoneNumber;

      if (!token && !phoneNumber) {
        this.logger.warn(`Client ${client.id} connected without identifier`);
        client.disconnect();
        return;
      }

      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync(token);
          const userId = payload.sub;
          this.userSockets.set(userId, client.id);
          client.join(`user_${userId}`);
          this.logger.log(`User ${userId} connected on socket ${client.id}`);
          return;
        } catch (e) {
          this.logger.warn(`Invalid token for ${client.id}, falling back to phone if available`);
        }
      }

      if (phoneNumber) {
        // Allow ephemeral connection via phone number for logged-out alerts
        client.join(`phone_${phoneNumber}`);
        this.logger.log(`Guest phone ${phoneNumber} connected on socket ${client.id}`);
      }
    } catch (err: any) {
      this.logger.error(`Connection failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
    
    // Fallback to phone-based room if available in data
    const phone = data.phoneNumber || data.recipientPhone || data.phone;
    if (phone) {
      this.server.to(`phone_${phone}`).emit(event, data);
    }
    
    this.logger.log(`Sent ${event} to user ${userId} and phone room ${phone || 'none'}`);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: new Date().toISOString() };
  }
}
