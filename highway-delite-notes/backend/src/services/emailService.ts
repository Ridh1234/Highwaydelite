import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// Ensure environment variables are loaded even if this module is imported before index.ts runs dotenv.config()
dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private validated = false;

  private validateEnv() {
    if (this.validated) return;
    const required = ['EMAIL_HOST','EMAIL_PORT','EMAIL_USER','EMAIL_PASS'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
      console.error('[EmailService] Missing required env vars:', missing.join(', '));
      throw new Error('Email configuration incomplete');
    }
    this.validated = true;
    console.log('[EmailService] Env loaded:', {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_SECURE: process.env.EMAIL_SECURE,
      EMAIL_USER: process.env.EMAIL_USER ? '***masked***' : undefined
    });
  }

  private getTransporter(): nodemailer.Transporter {
    this.validateEnv();
    if (!this.transporter) {
      const host = process.env.EMAIL_HOST!;
      const port = parseInt(process.env.EMAIL_PORT || '587', 10);
      const secure = process.env.EMAIL_SECURE === 'true';
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
      });
      console.log('[EmailService] Transporter initialized ->', { host, port, secure });
    }
    return this.transporter;
  }

  async sendOTP(email: string, otp: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"Highway Delite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Highway Delite Verification Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#333; background:#f7f7f7; margin:0; padding:20px; }
            .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); }
            .header { background:linear-gradient(135deg,#667eea 0%, #764ba2 100%); color:#fff; padding:30px; text-align:center; }
            .logo { font-size:24px; font-weight:bold; margin-bottom:10px; }
            .content { padding:30px; text-align:center; }
            .otp-code { background:#f8f9fa; border:2px solid #667eea; border-radius:8px; font-size:32px; font-weight:bold; color:#667eea; padding:20px; margin:20px 0; letter-spacing:8px; }
            .footer { background:#f8f9fa; padding:20px; text-align:center; color:#666; font-size:14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><div class="logo">🌟 HD</div><h1>Highway Delite</h1></div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Welcome to Highway Delite. Please use the following verification code to complete your signup:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Highway Delite. All rights reserved.</p>
              <p>This is an automated message; please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] OTP sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Error sending OTP:', (error as any)?.message || error);
      throw new Error('Failed to send OTP email');
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new EmailService();
