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

  async sendResetPasswordEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL', 'http://localhost:5000')}/auth/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your Sgroup password',
        template: 'reset-password',
        context: {
          name,
          email,
          resetUrl,
        },
      });
    } catch (error) {
      console.error('Failed to send reset password email:', error);
      throw error;
    }
  }

  async sendNotificationAddWorkspace(
    email: string,
    name: string,
    workspaceName: string,
    invitedBy?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `You've been added to ${workspaceName} workspace`,
        template: 'add-workspace-notification',
        context: {
          name,
          workspaceName,
          invitedBy: invitedBy || 'Team',
          workspaceUrl: `${this.configService.get('APP_URL', 'http://localhost:5000')}/workspaces`,
        },
      });
    } catch (error) {
      console.error('Failed to send workspace notification email:', error);
      // Don't throw error to avoid breaking the add member flow
    }
  }
}
