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
    const activationLink = `${this.configService.get('APP_URL')}/auth/activate/${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: to,
      subject: 'Activation de votre compte GoofyChain',
      html: `
        <h1>Bienvenue sur GoofyChain!</h1>
        <p>Pour activer votre compte, veuillez cliquer sur le lien suivant:</p>
        <a href="${activationLink}">Activer mon compte</a>
        <p>Ce lien est valable pendant 24 heures.</p>
      `,
    });
  }
}
