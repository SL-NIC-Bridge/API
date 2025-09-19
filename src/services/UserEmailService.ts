import { UserAccountStatusEnum } from '@prisma/client';
import nodemailer from 'nodemailer';

interface Division {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
//   nic: string;
  role: string;
  currentStatus: UserAccountStatusEnum;
  division?: Division;
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

// Helper function to get status color and icon
const getStatusStyling = (status: UserAccountStatusEnum) => {
  switch (status) {
    case UserAccountStatusEnum.ACTIVE:
      return { color: '#28a745', bgColor: '#d4edda', borderColor: '#c3e6cb', icon: '✅' };
    case UserAccountStatusEnum.DEACTIVATED:
      return { color: '#ffc107', bgColor: '#fff3cd', borderColor: '#ffeaa7', icon: '⏸️' };
    case UserAccountStatusEnum.REJECTED:
      return { color: '#dc3545', bgColor: '#f8d7da', borderColor: '#f5c6cb', icon: '❌' };
    case UserAccountStatusEnum.PENDING_APPROVAL:
      return { color: '#17a2b8', bgColor: '#d1ecf1', borderColor: '#bee5eb', icon: '⏳' };
    
    default:
      return { color: '#6c757d', bgColor: '#f8f9fa', borderColor: '#dee2e6', icon: '❓' };
  }
};

// Email templates
const emailTemplates = {
  // ... existing division templates ...

  userStatusChanged: (user: User, oldStatus: UserAccountStatusEnum, newStatus: UserAccountStatusEnum, comment?: string, changedBy?: string): EmailTemplate => {
    const oldStyling = getStatusStyling(oldStatus);
    const newStyling = getStatusStyling(newStatus);
    
    return {
      subject: `User Status Changed: ${user.firstName} ${user.lastName} - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${newStyling.icon} User Status Changed</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            
            <!-- User Information -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">User Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 35%;"><strong>Full Name:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${user.email}</td>
                </tr>
                
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Role:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${user.role}</td>
                </tr>
                ${user.division ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${user.division.name} (${user.division.code})</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0;"><strong>User ID:</strong></td>
                  <td style="padding: 10px 0;">${user.id}</td>
                </tr>
              </table>
            </div>

            <!-- Status Change -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Status Change Details</h2>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <!-- Old Status -->
                <div style="flex: 1; text-align: center;">
                  <div style="background: ${oldStyling.bgColor}; color: ${oldStyling.color}; padding: 15px; border-radius: 8px; border: 1px solid ${oldStyling.borderColor}; margin-bottom: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">${oldStyling.icon}</div>
                    <div style="font-weight: bold; font-size: 16px;">${oldStatus}</div>
                    <div style="font-size: 12px; opacity: 0.8;">Previous Status</div>
                  </div>
                </div>
                
                <!-- Arrow -->
                <div style="flex: 0 0 60px; text-align: center; font-size: 24px; color: #666;">
                  →
                </div>
                
                <!-- New Status -->
                <div style="flex: 1; text-align: center;">
                  <div style="background: ${newStyling.bgColor}; color: ${newStyling.color}; padding: 15px; border-radius: 8px; border: 1px solid ${newStyling.borderColor}; margin-bottom: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">${newStyling.icon}</div>
                    <div style="font-weight: bold; font-size: 16px;">${newStatus}</div>
                    <div style="font-size: 12px; opacity: 0.8;">Current Status</div>
                  </div>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 35%;"><strong>Changed At:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                </tr>
                ${changedBy ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Changed By:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">User ID: ${changedBy}</td>
                </tr>
                ` : ''}
                ${comment ? `
                <tr>
                  <td style="padding: 10px 0;"><strong>Comment:</strong></td>
                  <td style="padding: 10px 0;">${comment}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Status Information -->
            ${newStatus === UserAccountStatusEnum.ACTIVE ? `
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
              <p style="margin: 0; color: #155724;"><strong>✅ User Activated:</strong> The user account is now active and can access the system.</p>
            </div>
            ` : ''}

            ${newStatus === UserAccountStatusEnum.REJECTED ? `
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 20px;">
              <p style="margin: 0; color: #721c24;"><strong>❌ User Rejected:</strong> The user account has been rejected and cannot access the system.</p>
            </div>
            ` : ''}

            ${newStatus === UserAccountStatusEnum.DEACTIVATED ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;"><strong>⏸️ User Deactivated:</strong> The user account has been temporarily deactivated.</p>
            </div>
            ` : ''}

            ${newStatus === UserAccountStatusEnum.PENDING_APPROVAL ? `
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 20px;">
              <p style="margin: 0; color: #0c5460;"><strong>⏳ Pending Approval:</strong> The user account is waiting for approval.</p>
            </div>
            ` : ''}

            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>This is an automated notification from the SL NIC Management System.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        User Status Changed

        User Information:
        Full Name: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Role: ${user.role}
        ${user.division ? `Division: ${user.division.name} (${user.division.code})` : ''}
        User ID: ${user.id}

        Status Change:
        Previous Status: ${oldStatus}
        Current Status: ${newStatus}
        Changed At: ${new Date().toLocaleString()}
        ${changedBy ? `Changed By: User ID ${changedBy}` : ''}
        ${comment ? `Comment: ${comment}` : ''}

        This is an automated notification from the SL NIC Management System.
      `
    };
  },

  // Template for notifying the user themselves
  userStatusChangedSelfNotification: (user: User, oldStatus: UserAccountStatusEnum, newStatus: UserAccountStatusEnum, comment?: string): EmailTemplate => {
    const styling = getStatusStyling(newStatus);
    
    return {
      subject: `Your Account Status Has Been Updated - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${styling.icon} Account Status Update</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Dear ${user.firstName} ${user.lastName},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">Your account status has been updated in the SL NIC Management System.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: ${styling.bgColor}; color: ${styling.color}; padding: 20px; border-radius: 8px; border: 1px solid ${styling.borderColor}; display: inline-block; min-width: 200px;">
                  <div style="font-size: 32px; margin-bottom: 10px;">${styling.icon}</div>
                  <div style="font-weight: bold; font-size: 20px; margin-bottom: 5px;">${newStatus}</div>
                  <div style="font-size: 14px; opacity: 0.8;">Current Status</div>
                </div>
              </div>

              ${comment ? `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Administrator Comment:</h3>
                <p style="margin-bottom: 0; color: #666; font-style: italic;">"${comment}"</p>
              </div>
              ` : ''}

              ${newStatus === UserAccountStatusEnum.ACTIVE ? `
              <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 0; color: #155724;"><strong>🎉 Congratulations!</strong> Your account is now active. You can now access all system features.</p>
              </div>
              ` : ''}

              ${newStatus === UserAccountStatusEnum.REJECTED ? `
              <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                <p style="margin: 0; color: #721c24;"><strong>Account Rejected:</strong> Unfortunately, your account application has been rejected. Please contact the administrator for more information.</p>
              </div>
              ` : ''}

              ${newStatus === UserAccountStatusEnum.DEACTIVATED ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Account Deactivated:</strong> Your account has been temporarily deactivated. Please contact the administrator for assistance.</p>
              </div>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #666; font-size: 14px; margin-bottom: 5px;"><strong>Account Details:</strong></p>
                <p style="color: #666; font-size: 14px; margin: 0;">Email: ${user.email}</p>
                <p style="color: #666; font-size: 14px; margin: 0;">Updated: ${new Date().toLocaleString()}</p>
              </div>
            </div>

            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>If you have any questions, please contact the system administrator.</p>
              <p>This is an automated notification from the SL NIC Management System.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Account Status Update

        Dear ${user.firstName} ${user.lastName},

        Your account status has been updated in the SL NIC Management System.

        Current Status: ${newStatus}
        ${comment ? `Administrator Comment: "${comment}"` : ''}

        Account Details:
        Email: ${user.email}
   
        Updated: ${new Date().toLocaleString()}

        ${newStatus === UserAccountStatusEnum.ACTIVE ? 
          '🎉 Congratulations! Your account is now active. You can now access all system features.' : ''
        }

        ${newStatus === UserAccountStatusEnum.REJECTED ? 
          'Unfortunately, your account application has been rejected. Please contact the administrator for more information.' : ''
        }

        ${newStatus === UserAccountStatusEnum.DEACTIVATED ? 
          'Your account has been temporarily deactivated. Please contact the administrator for assistance.' : ''
        }

        If you have any questions, please contact the system administrator.
        This is an automated notification from the SL NIC Management System.
      `
    };
  }
};

// Extended Email service class
export class UserEmailService {
  // Send user status change notification to admins
  static async sendUserStatusChanged(
    user: User, 
    oldStatus: UserAccountStatusEnum, 
    newStatus: UserAccountStatusEnum, 
    comment?: string, 
    changedBy?: string, 
    recipients: string[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
    try {
      console.log('📧 Starting to send user status change email...');
      console.log('👤 User:', `${user.firstName} ${user.lastName} (${user.email})`);
      console.log('🔄 Status change:', `${oldStatus} → ${newStatus}`);

      const defaultRecipients = [
        process.env['ADMIN_EMAIL'],
        'htharinduherath@gmail.com' // Your admin email
      ].filter(Boolean) as string[];
      
      const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
      console.log('👥 Email recipients:', allRecipients);
      
      if (allRecipients.length === 0) {
        console.warn('⚠️ No email recipients configured for user status change notification');
        return { success: false, error: 'No recipients configured', recipients: [] };
      }

      const template = emailTemplates.userStatusChanged(user, oldStatus, newStatus, comment, changedBy);
      
      const mailOptions = {
        from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
        to: allRecipients.join(', '),
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('📮 Sending status change email...');
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ User status change email sent successfully!');
      console.log('📬 Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        recipients: allRecipients
      };
    } catch (error) {
      console.error('❌ Error sending user status change email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: []
      };
    }
  }

  // Send notification to the user themselves
  static async sendUserStatusChangedSelfNotification(
    user: User, 
    oldStatus: UserAccountStatusEnum, 
    newStatus: UserAccountStatusEnum, 
    comment?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📧 Starting to send self-notification email...');
      console.log('👤 User:', `${user.firstName} ${user.lastName} (${user.email})`);

      const template = emailTemplates.userStatusChangedSelfNotification(user, oldStatus, newStatus, comment);
      
      const mailOptions = {
        from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      console.log('📮 Sending self-notification email to:', user.email);
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Self-notification email sent successfully!');
      console.log('📬 Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Error sending self-notification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send both admin notification and user self-notification
  static async sendAllUserStatusChangeNotifications(
    user: Omit<User, 'additionalData'>, 
    oldStatus: UserAccountStatusEnum, 
    newStatus: UserAccountStatusEnum, 
    comment?: string, 
    changedBy?: string, 
    adminRecipients: string[] = []
  ): Promise<{ adminNotification: any; userNotification: any }> {
    console.log('📧 Sending all user status change notifications...');

    // Send admin notification
    const adminResult = await this.sendUserStatusChanged(
      user, oldStatus, newStatus, comment, changedBy, adminRecipients
    );

    // Send user self-notification
    const userResult = await this.sendUserStatusChangedSelfNotification(
      user, oldStatus, newStatus, comment
    );

    console.log('📊 Notification results:', {
      admin: adminResult.success ? 'Success' : 'Failed',
      user: userResult.success ? 'Success' : 'Failed'
    });

    return {
      adminNotification: adminResult,
      userNotification: userResult
    };
  }
}