import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('APP_URL', 'http://localhost:5000')}/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác thực tài khoản của bạn',
        template: 'verification',
        context: {
          name,
          verificationUrl,
        },
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Chào mừng đến với Sgroup!',
        template: 'welcome',
        context: {
          name,
        },
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendNotificationAddWorkspace(
    email: string,
    name: string,
    projectName: string,
    projectUrl?: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bạn đã được thêm vào dự án: ' + projectName,
      template: 'notificationAddWorkspace',
      context: {
        name,
        workspaceName: projectName,
        workspaceUrl: projectUrl,
      },
    });
  }
}
