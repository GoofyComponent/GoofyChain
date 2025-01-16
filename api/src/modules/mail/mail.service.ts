import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendActivationEmail(to: string, token: string) {
    const appUrl = this.configService.get('APP_URL');
    if (!appUrl) {
      throw new Error('APP_URL not defined in environment variables');
    }

    // Construire l'URL d'activation en s'assurant qu'il n'y a pas de double slash
    const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    const activationLink = `${baseUrl}/api/v1/auth/activate/${token}`;

    const mailOptions = {
      from:
        this.configService.get('MAIL_FROM') ||
        '"GoofyChain" <no-reply@goofychain.com>',
      to: to,
      subject: 'Activate your GoofyChain account',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          }
          .token { 
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <h1>Welcome to GoofyChain!</h1>
          <p>To activate your account, please click the button below:</p>
          <a href="${activationLink}" class="button">Activate my account</a>
          <p>Or copy and paste this link into your browser:</p>
          <div class="token">${activationLink}</div>
          <p>This link is valid for 24 hours.</p>
          <p>If you did not create an account on GoofyChain, you can ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
          This is an automatic email, please do not reply.
          </p>
        </div>
        </body>
      </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending activation email:', error);
      throw new Error('Failed to send activation email');
    }
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('CLIENT_URL');
    if (!frontendUrl) {
      throw new Error('CLIENT_URL not defined in environment variables');
    }

    const baseUrl = frontendUrl.endsWith('/')
      ? frontendUrl.slice(0, -1)
      : frontendUrl;
    const resetPasswordLink = `${baseUrl}/reset-password/${token}`;

    const mailOptions = {
      from:
        this.configService.get('MAIL_FROM') ||
        '"GoofyChain" <no-reply@goofychain.com>',
      to: to,
      subject: 'Reset your GoofyChain password',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <h2>Reset your password</h2>
          <p>You requested a password reset. Click the link below to create a new password:</p>
          <p><a href="${resetPasswordLink}" class="button">Reset my password</a></p>
          <p>If you did not request this reset, you can ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        </body>
      </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
