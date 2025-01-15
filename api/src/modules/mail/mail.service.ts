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
      throw new Error("APP_URL non définie dans les variables d'environnement");
    }

    // Construire l'URL d'activation en s'assurant qu'il n'y a pas de double slash
    const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    const activationLink = `${baseUrl}/auth/activate/${token}`;

    const mailOptions = {
      from:
        this.configService.get('MAIL_FROM') ||
        '"GoofyChain" <no-reply@goofychain.com>',
      to: to,
      subject: 'Activation de votre compte GoofyChain',
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
              <h1>Bienvenue sur GoofyChain!</h1>
              <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <a href="${activationLink}" class="button">Activer mon compte</a>
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <div class="token">${activationLink}</div>
              <p>Ce lien est valable pendant 24 heures.</p>
              <p>Si vous n'avez pas créé de compte sur GoofyChain, vous pouvez ignorer cet email.</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                Ceci est un email automatique, merci de ne pas y répondre.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'activation:", error);
      throw new Error("Impossible d'envoyer l'email d'activation");
    }
  }
}
