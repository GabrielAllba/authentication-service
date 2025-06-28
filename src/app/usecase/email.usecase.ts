import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface EmailServiceGrpc {
  SendVerificationEmail(data: {
    email: string;
    emailVerificationToken: string;
  }): Observable<{ success: boolean }>;
}

@Injectable()
export class EmailUseCase implements OnModuleInit {
  private grpcService: EmailServiceGrpc;

  constructor(@Inject('EMAIL_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.grpcService = this.client.getService<EmailServiceGrpc>('EmailService');
    console.log('[EmailUseCase] gRPC service loaded');
  }

  async sendVerificationEmail(email: string, token: string) {
    console.log(
      `[EmailUseCase] Sending verification to ${email} with token ${token}`,
    );

    try {
      const response = await firstValueFrom(
        this.grpcService.SendVerificationEmail({
          email,
          emailVerificationToken: token,
        }),
      );

      console.log('[EmailUseCase] gRPC response:', response);
      return response;
    } catch (error) {
      console.error('[EmailUseCase] gRPC error:', error);
      throw error;
    }
  }
}
