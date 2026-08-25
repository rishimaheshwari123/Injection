import nodemailer from 'nodemailer';

/**
 * Sends a password reset notification email via SMTP.
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient full name
 * @param {string} newPassword - The new reset password
 * @returns {Promise<object>}
 */
export const sendResetPasswordEmail = async (email, name, newPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PRLT Healthcare Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset Notification - PRLT Healthcare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, #63D64F 0%, #3DB9A6 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">PRLT Healthcare Platform</h1>
          </div>
          <div style="padding: 20px 10px;">
            <p style="font-size: 16px; color: #333;">Dear ${name},</p>
            <p style="font-size: 14px; color: #555; line-height: 1.5;">
              Your account password has been reset directly by the platform administrator. Here are your new credentials:
            </p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px dashed #3DB9A6;">
              <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Username (Email):</strong> ${email}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #333;">
                <strong>New Password:</strong> 
                <code style="font-size: 16px; font-family: monospace; color: #d9534f; background: #fff; padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px;">${newPassword}</code>
              </p>
            </div>
            <p style="font-size: 14px; color: #d9534f; font-weight: bold; background-color: #fdf7f7; padding: 10px; border-radius: 5px; border-left: 4px solid #d9534f;">
              Important: For security reasons, please log in and change your password as soon as possible.
            </p>
            <p style="font-size: 14px; color: #555; line-height: 1.5; margin-top: 20px;">
              If you did not request this change, please contact our support team immediately.
            </p>
          </div>
          <div style="border-top: 1px solid #e5e5e5; padding-top: 15px; text-align: center; color: #888; font-size: 12px;">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} PRLT Healthcare Platform. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email: ' + error.message);
  }
};
