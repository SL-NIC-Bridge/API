import nodemailer from 'nodemailer';

interface Division {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: false,
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
});

// Verify connection configuration
transporter.verify((error, _success) => {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  divisionCreated: (division: Division): EmailTemplate => ({
    subject: `New GN Division Created: ${division.code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Division Created</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Division Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Code:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.code}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Created At:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.createdAt.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
                <td style="padding: 10px 0;">${division.id}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>This is an automated notification from the SL NIC Management System.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      New GN Division Created
      
      Division Code: ${division.code}
      Division Name: ${division.name}
      Created At: ${division.createdAt.toLocaleString()}
      Division ID: ${division.id}
      
      This is an automated notification from the SL NIC Management System.
    `
  }),

  divisionUpdated: (division: Division, oldData?: Partial<Division>): EmailTemplate => ({
    subject: `GN Division Updated: ${division.code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Division Updated</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Updated Division Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Code:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.code}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Updated At:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
                <td style="padding: 10px 0;">${division.id}</td>
              </tr>
            </table>
          </div>
          ${oldData ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Previous Values:</h3>
            ${oldData.code && oldData.code !== division.code ? `<p style="margin: 5px 0; color: #856404;">Code: ${oldData.code} → ${division.code}</p>` : ''}
            ${oldData.name && oldData.name !== division.name ? `<p style="margin: 5px 0; color: #856404;">Name: ${oldData.name} → ${division.name}</p>` : ''}
          </div>
          ` : ''}
          <div style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            <p>This is an automated notification from the SL NIC Management System.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      GN Division Updated
      
      Division Code: ${division.code}
      Division Name: ${division.name}
      Updated At: ${new Date().toLocaleString()}
      Division ID: ${division.id}
      
      ${oldData ? 
        `Previous Values:\n${oldData.code && oldData.code !== division.code ? `Code: ${oldData.code} → ${division.code}\n` : ''}${oldData.name && oldData.name !== division.name ? `Name: ${oldData.name} → ${division.name}` : ''}`
        : ''
      }
      
      This is an automated notification from the SL NIC Management System.
    `
  }),

  divisionDeleted: (division: Division): EmailTemplate => ({
    subject: `GN Division Deleted: ${division.code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #721c24; margin: 0; font-size: 24px;">Division Deleted</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
            <h2 style="color: #721c24; margin-top: 0;">Deleted Division Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Division Code:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${division.code}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Division Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${division.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Deleted At:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
                <td style="padding: 10px 0;">${division.id}</td>
              </tr>
            </table>
          </div>
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #bee5eb;">
            <p style="margin: 0; color: #0c5460;"><strong>⚠️ Important:</strong> This action is permanent and cannot be undone.</p>
          </div>
          <div style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            <p>This is an automated notification from the SL NIC Management System.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      GN Division Deleted
      
      Division Code: ${division.code}
      Division Name: ${division.name}
      Deleted At: ${new Date().toLocaleString()}
      Division ID: ${division.id}
      
      ⚠️ Important: This action is permanent and cannot be undone.
      
      This is an automated notification from the SL NIC Management System.
    `
  }),

  systemAlert: (title: string, message: string, data: Record<string, any> = {}): EmailTemplate => ({
    subject: `System Alert: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">System Alert</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">${title}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">${message}</p>
            ${Object.keys(data).length > 0 ? `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <h3 style="margin-top: 0; color: #333;">Additional Details:</h3>
                ${Object.entries(data).map(([key, value]) => 
                  `<p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>`
                ).join('')}
              </div>
            ` : ''}
          </div>
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Timestamp: ${new Date().toLocaleString()}</p>
            <p>This is an automated notification from the SL NIC Management System.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      System Alert: ${title}
      
      ${message}
      
      ${Object.keys(data).length > 0 ? 
        'Additional Details:\n' + Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n') + '\n'
        : ''
      }
      Timestamp: ${new Date().toLocaleString()}
      
      This is an automated notification from the SL NIC Management System.
    `
  })
};

// Email service class
export class EmailService {
  // Send division created notification
  static async sendDivisionCreated(division: Division, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
    try {
      console.log('🚀 Starting to send division created email...');
      console.log('📧 SMTP Config:', {
        host: process.env['SMTP_HOST'],
        port: process.env['SMTP_PORT'],
        user: process.env['SMTP_USER'],
        hasPassword: !!process.env['SMTP_PASS']
      });

      // Add your specific email to recipients
      const defaultRecipients = [
        process.env['ADMIN_EMAIL'],
        'herathhmtd.20@uom.lk' // Your target email
      ].filter(Boolean) as string[];
      
      const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
      console.log('👥 Email recipients:', allRecipients);
      
      if (allRecipients.length === 0) {
        console.warn('⚠️ No email recipients configured for division created notification');
        return { success: false, error: 'No recipients configured', recipients: [] };
      }

      const template = emailTemplates.divisionCreated(division);
      
      const mailOptions = {
        from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
        to: allRecipients.join(', '),
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('📮 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Division created email sent successfully!');
      console.log('📬 Message ID:', info.messageId);
      console.log('📊 Email info:', {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        recipients: allRecipients
      };
    } catch (error) {
      console.error('❌ Error sending division created email:');
      console.error('🔍 Error details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: []
      };
    }
  }

  // Send division updated notification
  static async sendDivisionUpdated(division: Division, oldData?: Partial<Division>, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
    try {
      console.log('🔄 Starting to send division updated email...');
      
      const defaultRecipients = [
        process.env['ADMIN_EMAIL'],
        'herathhmtd.20@uom.lk' // Your target email
      ].filter(Boolean) as string[];
      
      const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
      console.log('👥 Email recipients:', allRecipients);
      
      if (allRecipients.length === 0) {
        console.warn('⚠️ No email recipients configured for division updated notification');
        return { success: false, error: 'No recipients configured', recipients: [] };
      }

      const template = emailTemplates.divisionUpdated(division, oldData);
      
      const mailOptions = {
        from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
        to: allRecipients.join(', '),
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('📮 Sending update email...');
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Division updated email sent successfully!');
      console.log('📬 Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        recipients: allRecipients
      };
    } catch (error) {
      console.error('❌ Error sending division updated email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: []
      };
    }
  }

  // Send division deleted notification
  static async sendDivisionDeleted(division: Division, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
    try {
      console.log('🗑️ Starting to send division deleted email...');
      
      const defaultRecipients = [
        process.env['ADMIN_EMAIL'],
        'herathhmtd.20@uom.lk' // Your target email
      ].filter(Boolean) as string[];
      
      const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
      console.log('👥 Email recipients:', allRecipients);
      
      if (allRecipients.length === 0) {
        console.warn('⚠️ No email recipients configured for division deleted notification');
        return { success: false, error: 'No recipients configured', recipients: [] };
      }

      const template = emailTemplates.divisionDeleted(division);
      
      const mailOptions = {
        from: `"GN Division System" <${process.env['SMTP_USER']}>`,
        to: allRecipients.join(', '),
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('📮 Sending deletion email...');
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Division deleted email sent successfully!');
      console.log('📬 Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        recipients: allRecipients
      };
    } catch (error) {
      console.error('❌ Error sending division deleted email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: []
      };
    }
  }

  // Send system alert
  static async sendSystemAlert(title: string, message: string, data: Record<string, any> = {}, recipients: string[] = []): Promise<void> {
    try {
      const defaultRecipients = process.env['ADMIN_EMAIL'] ? [process.env['ADMIN_EMAIL']] : [];
      const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
      if (allRecipients.length === 0) {
        console.warn('No email recipients configured for system alert');
        return;
      }

      const template = emailTemplates.systemAlert(title, message, data);
      
      const mailOptions = {
        from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
        to: allRecipients.join(', '),
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('System alert email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending system alert email:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Test email connection
  static async testConnection(): Promise<{ connected: boolean; error?: string; config: any }> {
    try {
      console.log('🔌 Testing SMTP connection...');
      console.log('⚙️ Current config:', {
        host: process.env['SMTP_HOST'],
        port: process.env['SMTP_PORT'],
        user: process.env['SMTP_USER'],
        hasPassword: !!process.env['SMTP_PASS']
      });
      
      await transporter.verify();
      console.log('✅ SMTP connection successful!');
      
      return {
        connected: true,
        config: {
          host: process.env['SMTP_HOST'],
          port: process.env['SMTP_PORT'],
          user: process.env['SMTP_USER'],
        }
      };
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          host: process.env['SMTP_HOST'],
          port: process.env['SMTP_PORT'],
          user: process.env['SMTP_USER'],
        }
      };
    }
  }
}