// import nodemailer from 'nodemailer';

// interface Division {
//   id: string;
//   code: string;
//   name: string;
//   createdAt: Date;
//   updatedAt?: Date;
// }

// interface EmailTemplate {
//   subject: string;
//   html: string;
//   text: string;
// }

// // Create transporter
// const transporter = nodemailer.createTransport({
//   host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
//   port: parseInt(process.env['SMTP_PORT'] || '587'),
//   secure: false,
//   auth: {
//     user: process.env['SMTP_USER'],
//     pass: process.env['SMTP_PASS'],
//   },
// });

// // Verify connection configuration
// transporter.verify((error, _success) => {
//   if (error) {
//     console.log('SMTP connection error:', error);
//   } else {
//     console.log('SMTP server is ready to send emails');
//   }
// });

// // Email templates
// const emailTemplates = {
//   divisionCreated: (division: Division): EmailTemplate => ({
//     subject: `New GN Division Created: ${division.code}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
//           <h1 style="color: white; margin: 0; font-size: 24px;">New Division Created</h1>
//         </div>
//         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//             <h2 style="color: #333; margin-top: 0;">Division Details</h2>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Code:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.code}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Name:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.name}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Created At:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.createdAt.toLocaleString()}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
//                 <td style="padding: 10px 0;">${division.id}</td>
//               </tr>
//             </table>
//           </div>
//           <div style="text-align: center; color: #666; font-size: 14px;">
//             <p>This is an automated notification from the SL NIC Management System.</p>
//           </div>
//         </div>
//       </div>
//     `,
//     text: `
//       New GN Division Created
      
//       Division Code: ${division.code}
//       Division Name: ${division.name}
//       Created At: ${division.createdAt.toLocaleString()}
//       Division ID: ${division.id}
      
//       This is an automated notification from the SL NIC Management System.
//     `
//   }),

//   divisionUpdated: (division: Division, oldData?: Partial<Division>): EmailTemplate => ({
//     subject: `GN Division Updated: ${division.code}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px 10px 0 0;">
//           <h1 style="color: #333; margin: 0; font-size: 24px;">Division Updated</h1>
//         </div>
//         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//             <h2 style="color: #333; margin-top: 0;">Updated Division Details</h2>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Code:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.code}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Division Name:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${division.name}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Updated At:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
//                 <td style="padding: 10px 0;">${division.id}</td>
//               </tr>
//             </table>
//           </div>
//           ${oldData ? `
//           <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
//             <h3 style="color: #856404; margin-top: 0;">Previous Values:</h3>
//             ${oldData.code && oldData.code !== division.code ? `<p style="margin: 5px 0; color: #856404;">Code: ${oldData.code} → ${division.code}</p>` : ''}
//             ${oldData.name && oldData.name !== division.name ? `<p style="margin: 5px 0; color: #856404;">Name: ${oldData.name} → ${division.name}</p>` : ''}
//           </div>
//           ` : ''}
//           <div style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
//             <p>This is an automated notification from the SL NIC Management System.</p>
//           </div>
//         </div>
//       </div>
//     `,
//     text: `
//       GN Division Updated
      
//       Division Code: ${division.code}
//       Division Name: ${division.name}
//       Updated At: ${new Date().toLocaleString()}
//       Division ID: ${division.id}
      
//       ${oldData ? 
//         `Previous Values:\n${oldData.code && oldData.code !== division.code ? `Code: ${oldData.code} → ${division.code}\n` : ''}${oldData.name && oldData.name !== division.name ? `Name: ${oldData.name} → ${division.name}` : ''}`
//         : ''
//       }
      
//       This is an automated notification from the SL NIC Management System.
//     `
//   }),

//   divisionDeleted: (division: Division): EmailTemplate => ({
//     subject: `GN Division Deleted: ${division.code}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 20px; border-radius: 10px 10px 0 0;">
//           <h1 style="color: #721c24; margin: 0; font-size: 24px;">Division Deleted</h1>
//         </div>
//         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
//           <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
//             <h2 style="color: #721c24; margin-top: 0;">Deleted Division Details</h2>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Division Code:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${division.code}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Division Name:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${division.name}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;"><strong>Deleted At:</strong></td>
//                 <td style="padding: 10px 0; border-bottom: 1px solid #f5c6cb;">${new Date().toLocaleString()}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0;"><strong>Division ID:</strong></td>
//                 <td style="padding: 10px 0;">${division.id}</td>
//               </tr>
//             </table>
//           </div>
//           <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #bee5eb;">
//             <p style="margin: 0; color: #0c5460;"><strong>⚠️ Important:</strong> This action is permanent and cannot be undone.</p>
//           </div>
//           <div style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
//             <p>This is an automated notification from the SL NIC Management System.</p>
//           </div>
//         </div>
//       </div>
//     `,
//     text: `
//       GN Division Deleted
      
//       Division Code: ${division.code}
//       Division Name: ${division.name}
//       Deleted At: ${new Date().toLocaleString()}
//       Division ID: ${division.id}
      
//       ⚠️ Important: This action is permanent and cannot be undone.
      
//       This is an automated notification from the SL NIC Management System.
//     `
//   }),

//   systemAlert: (title: string, message: string, data: Record<string, any> = {}): EmailTemplate => ({
//     subject: `System Alert: ${title}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
//           <h1 style="color: white; margin: 0; font-size: 24px;">System Alert</h1>
//         </div>
//         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//             <h2 style="color: #333; margin-top: 0;">${title}</h2>
//             <p style="color: #666; font-size: 16px; line-height: 1.5;">${message}</p>
//             ${Object.keys(data).length > 0 ? `
//               <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
//                 <h3 style="margin-top: 0; color: #333;">Additional Details:</h3>
//                 ${Object.entries(data).map(([key, value]) => 
//                   `<p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>`
//                 ).join('')}
//               </div>
//             ` : ''}
//           </div>
//           <div style="text-align: center; color: #666; font-size: 14px;">
//             <p>Timestamp: ${new Date().toLocaleString()}</p>
//             <p>This is an automated notification from the SL NIC Management System.</p>
//           </div>
//         </div>
//       </div>
//     `,
//     text: `
//       System Alert: ${title}
      
//       ${message}
      
//       ${Object.keys(data).length > 0 ? 
//         'Additional Details:\n' + Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n') + '\n'
//         : ''
//       }
//       Timestamp: ${new Date().toLocaleString()}
      
//       This is an automated notification from the SL NIC Management System.
//     `
//   })
// };

// // Email service class
// export class EmailService {
//   // Send division created notification
//   static async sendDivisionCreated(division: Division, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
//     try {
//       console.log('🚀 Starting to send division created email...');
//       console.log('📧 SMTP Config:', {
//         host: process.env['SMTP_HOST'],
//         port: process.env['SMTP_PORT'],
//         user: process.env['SMTP_USER'],
//         hasPassword: !!process.env['SMTP_PASS']
//       });

//       // Add your specific email to recipients
//       const defaultRecipients = [
//         process.env['ADMIN_EMAIL'],
//         'hitihamuhmcnb.20@uom.lk' // Your target email
//       ].filter(Boolean) as string[];
      
//       const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
//       console.log('👥 Email recipients:', allRecipients);
      
//       if (allRecipients.length === 0) {
//         console.warn('⚠️ No email recipients configured for division created notification');
//         return { success: false, error: 'No recipients configured', recipients: [] };
//       }

//       const template = emailTemplates.divisionCreated(division);
      
//       const mailOptions = {
//         from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
//         to: allRecipients.join(', '),
//         subject: template.subject,
//         text: template.text,
//         html: template.html,
//       };

//       console.log('📮 Sending email with options:', {
//         from: mailOptions.from,
//         to: mailOptions.to,
//         subject: mailOptions.subject
//       });

//       const info = await transporter.sendMail(mailOptions);
      
//       console.log('✅ Division created email sent successfully!');
//       console.log('📬 Message ID:', info.messageId);
//       console.log('📊 Email info:', {
//         accepted: info.accepted,
//         rejected: info.rejected,
//         response: info.response
//       });

//       return {
//         success: true,
//         messageId: info.messageId,
//         recipients: allRecipients
//       };
//     } catch (error) {
//       console.error('❌ Error sending division created email:');
//       console.error('🔍 Error details:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//         recipients: []
//       };
//     }
//   }

//   // Send division updated notification
//   static async sendDivisionUpdated(division: Division, oldData?: Partial<Division>, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
//     try {
//       console.log('🔄 Starting to send division updated email...');
      
//       const defaultRecipients = [
//         process.env['ADMIN_EMAIL'],
//         'herathhmtd.20@uom.lk' // Your target email
//       ].filter(Boolean) as string[];
      
//       const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
//       console.log('👥 Email recipients:', allRecipients);
      
//       if (allRecipients.length === 0) {
//         console.warn('⚠️ No email recipients configured for division updated notification');
//         return { success: false, error: 'No recipients configured', recipients: [] };
//       }

//       const template = emailTemplates.divisionUpdated(division, oldData);
      
//       const mailOptions = {
//         from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
//         to: allRecipients.join(', '),
//         subject: template.subject,
//         text: template.text,
//         html: template.html,
//       };

//       console.log('📮 Sending update email...');
//       const info = await transporter.sendMail(mailOptions);
      
//       console.log('✅ Division updated email sent successfully!');
//       console.log('📬 Message ID:', info.messageId);

//       return {
//         success: true,
//         messageId: info.messageId,
//         recipients: allRecipients
//       };
//     } catch (error) {
//       console.error('❌ Error sending division updated email:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//         recipients: []
//       };
//     }
//   }

//   // Send division deleted notification
//   static async sendDivisionDeleted(division: Division, recipients: string[] = []): Promise<{ success: boolean; messageId?: string; error?: string; recipients: string[] }> {
//     try {
//       console.log('🗑️ Starting to send division deleted email...');
      
//       const defaultRecipients = [
//         process.env['ADMIN_EMAIL'],
//         'herathhmtd.20@uom.lk' // Your target email
//       ].filter(Boolean) as string[];
      
//       const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
//       console.log('👥 Email recipients:', allRecipients);
      
//       if (allRecipients.length === 0) {
//         console.warn('⚠️ No email recipients configured for division deleted notification');
//         return { success: false, error: 'No recipients configured', recipients: [] };
//       }

//       const template = emailTemplates.divisionDeleted(division);
      
//       const mailOptions = {
//         from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
//         to: allRecipients.join(', '),
//         subject: template.subject,
//         text: template.text,
//         html: template.html,
//       };

//       console.log('📮 Sending deletion email...');
//       const info = await transporter.sendMail(mailOptions);
      
//       console.log('✅ Division deleted email sent successfully!');
//       console.log('📬 Message ID:', info.messageId);

//       return {
//         success: true,
//         messageId: info.messageId,
//         recipients: allRecipients
//       };
//     } catch (error) {
//       console.error('❌ Error sending division deleted email:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//         recipients: []
//       };
//     }
//   }

//   // Send system alert
//   static async sendSystemAlert(title: string, message: string, data: Record<string, any> = {}, recipients: string[] = []): Promise<void> {
//     try {
//       const defaultRecipients = process.env['ADMIN_EMAIL'] ? [process.env['ADMIN_EMAIL']] : [];
//       const allRecipients = [...new Set([...defaultRecipients, ...recipients])];
      
//       if (allRecipients.length === 0) {
//         console.warn('No email recipients configured for system alert');
//         return;
//       }

//       const template = emailTemplates.systemAlert(title, message, data);
      
//       const mailOptions = {
//         from: `"SL NIC System" <${process.env['SMTP_USER']}>`,
//         to: allRecipients.join(', '),
//         subject: template.subject,
//         text: template.text,
//         html: template.html,
//       };

//       const info = await transporter.sendMail(mailOptions);
//       console.log('System alert email sent:', info.messageId);
//     } catch (error) {
//       console.error('Error sending system alert email:', error);
//       // Don't throw error to avoid breaking the main flow
//     }
//   }

//   // Test email connection
//   static async testConnection(): Promise<{ connected: boolean; error?: string; config: any }> {
//     try {
//       console.log('🔌 Testing SMTP connection...');
//       console.log('⚙️ Current config:', {
//         host: process.env['SMTP_HOST'],
//         port: process.env['SMTP_PORT'],
//         user: process.env['SMTP_USER'],
//         hasPassword: !!process.env['SMTP_PASS']
//       });
      
//       await transporter.verify();
//       console.log('✅ SMTP connection successful!');
      
//       return {
//         connected: true,
//         config: {
//           host: process.env['SMTP_HOST'],
//           port: process.env['SMTP_PORT'],
//           user: process.env['SMTP_USER'],
//         }
//       };
//     } catch (error) {
//       console.error('❌ SMTP connection failed:', error);
//       return {
//         connected: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//         config: {
//           host: process.env['SMTP_HOST'],
//           port: process.env['SMTP_PORT'],
//           user: process.env['SMTP_USER'],
//         }
//       };
//     }
//   }
// }




import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'],
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: false,
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
});
import { $Enums } from '@prisma/client';

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface ApplicationEmailData {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  applicationId: string;
  applicationType: string;
  status: $Enums.ApplicationCurrentStatus;
  comment?: string | undefined;
  actorName?: string | undefined;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env['SMTP_USER'];
  private static readonly ADMIN_EMAIL = process.env['ADMIN_EMAIL'];

  /**
   * Get email template based on application status
   */
  private static getEmailTemplate(status: $Enums.ApplicationCurrentStatus, data: ApplicationEmailData): EmailTemplate {
    const { userFirstName, applicationId, applicationType, comment, actorName } = data;

    switch (status) {
      case 'SUBMITTED':
        return {
          subject: `Application Submitted Successfully - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Application Submitted</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your application has been received</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Thank you for submitting your <strong>${applicationType}</strong> application. We have successfully received your application and it is now under review.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Submitted</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  You will receive email updates as your application progresses through our review process. Please keep this application ID for your records.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Application</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you have any questions, please contact us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

Thank you for submitting your ${applicationType} application.

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: Submitted
- Submitted: ${new Date().toLocaleDateString()}

You will receive email updates as your application progresses through our review process.

Best regards,
Application Review Team
          `
        };

      case 'APPROVED_BY_GN':
        return {
          subject: `Application Approved by GN - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🎉 Application Approved!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Great news about your application</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  We are pleased to inform you that your <strong>${applicationType}</strong> application has been <strong style="color: #28a745;">approved by the Grama Niladhari (GN)</strong>.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Approved by GN</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Approved by:</strong> ${actorName || 'Grama Niladhari'}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                  ${comment ? `<p style="margin: 10px 0 5px 0; color: #666;"><strong>Comments:</strong></p><p style="margin: 5px 0; color: #555; font-style: italic; background: #f1f3f4; padding: 10px; border-radius: 4px;">${comment}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Your application will now proceed to the next stage of the review process. You will be notified of any further updates.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you have any questions, please contact us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

Great news! Your ${applicationType} application has been approved by the Grama Niladhari (GN).

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: Approved by GN
- Approved by: ${actorName || 'Grama Niladhari'}
- Updated: ${new Date().toLocaleDateString()}
${comment ? `- Comments: ${comment}` : ''}

Your application will now proceed to the next stage of the review process.

Best regards,
Application Review Team
          `
        };

      case 'REJECTED_BY_GN':
        return {
          subject: `Application Status Update - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Application Status Update</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Important update regarding your application</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  We regret to inform you that your <strong>${applicationType}</strong> application has not been approved at this stage by the Grama Niladhari (GN).
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Not Approved by GN</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Reviewed by:</strong> ${actorName || 'Grama Niladhari'}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                  ${comment ? `<p style="margin: 10px 0 5px 0; color: #666;"><strong>Feedback:</strong></p><p style="margin: 5px 0; color: #555; background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">${comment}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  ${comment ? 'Please review the feedback provided above and consider resubmitting your application with the necessary modifications.' : 'You may contact the Grama Niladhari office for more information about the reasons for this decision.'}
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you have any questions about this decision, please contact us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

We regret to inform you that your ${applicationType} application has not been approved at this stage by the Grama Niladhari (GN).

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: Not Approved by GN
- Reviewed by: ${actorName || 'Grama Niladhari'}
- Updated: ${new Date().toLocaleDateString()}
${comment ? `- Feedback: ${comment}` : ''}

${comment ? 'Please review the feedback provided above and consider resubmitting your application with the necessary modifications.' : 'You may contact the Grama Niladhari office for more information.'}

Best regards,
Application Review Team
          `
        };

      case 'ON_HOLD_BY_DS':
        return {
          subject: `Application On Hold - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Application On Hold</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Temporary hold on your application</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Your <strong>${applicationType}</strong> application has been temporarily placed <strong style="color: #fd7e14;">on hold</strong> by the Divisional Secretary (DS) office.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #fd7e14; font-weight: bold;">On Hold by DS</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Reviewed by:</strong> ${actorName || 'Divisional Secretary'}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                  ${comment ? `<p style="margin: 10px 0 5px 0; color: #666;"><strong>Reason:</strong></p><p style="margin: 5px 0; color: #555; background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">${comment}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  This hold is temporary and may require additional documentation or clarification. 
                  ${comment ? 'Please review the reason provided above.' : 'The DS office will contact you if any additional information is needed.'}
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  For more information, please contact us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

Your ${applicationType} application has been temporarily placed on hold by the Divisional Secretary (DS) office.

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: On Hold by DS
- Reviewed by: ${actorName || 'Divisional Secretary'}
- Updated: ${new Date().toLocaleDateString()}
${comment ? `- Reason: ${comment}` : ''}

This hold is temporary and may require additional documentation or clarification.

Best regards,
Application Review Team
          `
        };

      case 'SENT_TO_DRP':
        return {
          subject: `Application Forwarded to DRP - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Application Forwarded</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your application has been sent to DRP</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Your <strong>${applicationType}</strong> application has been forwarded to the <strong style="color: #17a2b8;">District Registration of Persons (DRP)</strong> office for final processing.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #17a2b8; font-weight: bold;">Sent to DRP</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Forwarded by:</strong> ${actorName || 'Divisional Secretary'}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                  ${comment ? `<p style="margin: 10px 0 5px 0; color: #666;"><strong>Notes:</strong></p><p style="margin: 5px 0; color: #555; font-style: italic; background: #e7f3ff; padding: 10px; border-radius: 4px;">${comment}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Your application is now in the final stage of processing. The DRP office will handle the completion of your request. Processing times may vary depending on the complexity of your application.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Progress</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  For updates on final processing, please contact the DRP office or reach us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

Your ${applicationType} application has been forwarded to the District Registration of Persons (DRP) office for final processing.

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: Sent to DRP
- Forwarded by: ${actorName || 'Divisional Secretary'}
- Updated: ${new Date().toLocaleDateString()}
${comment ? `- Notes: ${comment}` : ''}

Your application is now in the final stage of processing.

Best regards,
Application Review Team
          `
        };

      default:
        return {
          subject: `Application Status Update - ${applicationId}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Status Update</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your application status has been updated</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userFirstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Your <strong>${applicationType}</strong> application status has been updated.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6c757d; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Application Details:</h3>
                  <p style="margin: 5px 0; color: #666;"><strong>Application ID:</strong> ${applicationId}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${applicationType}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #6c757d; font-weight: bold;">${status}</span></p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated by:</strong> ${actorName || 'System'}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                  ${comment ? `<p style="margin: 10px 0 5px 0; color: #666;"><strong>Comments:</strong></p><p style="margin: 5px 0; color: #555; font-style: italic; background: #f1f3f4; padding: 10px; border-radius: 4px;">${comment}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you have any questions, please contact us at ${EmailService.ADMIN_EMAIL}
                </p>
              </div>
            </div>
          `,
          textBody: `
Dear ${userFirstName},

Your ${applicationType} application status has been updated.

Application Details:
- Application ID: ${applicationId}
- Type: ${applicationType}
- Status: ${status}
- Updated by: ${actorName || 'System'}
- Updated: ${new Date().toLocaleDateString()}
${comment ? `- Comments: ${comment}` : ''}

Best regards,
Application Review Team
          `
        };
    }
  }

  /**
   * Send application status update email
   */
  static async sendApplicationStatusUpdate(emailData: ApplicationEmailData): Promise<void> {
    try {
      const template = EmailService.getEmailTemplate(emailData.status, emailData);
      
      const mailOptions = {
        from: `"Application System" <${EmailService.FROM_EMAIL}>`,
        to: emailData.userEmail,
        subject: template.subject,
        text: template.textBody,
        html: template.htmlBody,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${emailData.userEmail}:`, result.messageId);
      
      // Send copy to admin for important status changes
      if (['APPROVED_BY_GN', 'REJECTED_BY_GN'].includes(emailData.status)) {
        await EmailService.sendAdminNotification(emailData, template.subject);
      }
      
    } catch (error) {
      console.error('Error sending application status email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send notification to admin about important status changes
   */
  private static async sendAdminNotification(emailData: ApplicationEmailData, originalSubject: string): Promise<void> {
    try {
      const adminMailOptions = {
        from: `"Application System" <${EmailService.FROM_EMAIL}>`,
        to: EmailService.ADMIN_EMAIL,
        subject: `Admin Notification: ${originalSubject}`,
        text: `
Admin Notification

Application Status Changed:
- Application ID: ${emailData.applicationId}
- User: ${emailData.userFirstName} ${emailData.userLastName} (${emailData.userEmail})
- Type: ${emailData.applicationType}
- New Status: ${emailData.status}
- Changed by: ${emailData.actorName || 'System'}
- Date: ${new Date().toLocaleString()}
${emailData.comment ? `- Comments: ${emailData.comment}` : ''}

User has been notified via email.
        `,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa;">
            <h2 style="color: #495057;">Admin Notification</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <h3 style="margin-top: 0; color: #333;">Application Status Changed</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Application ID:</td><td>${emailData.applicationId}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">User:</td><td>${emailData.userFirstName} ${emailData.userLastName} (${emailData.userEmail})</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td>${emailData.applicationType}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">New Status:</td><td><strong style="color: #dc3545;">${emailData.status}</strong></td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Changed by:</td><td>${emailData.actorName || 'System'}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${new Date().toLocaleString()}</td></tr>
                ${emailData.comment ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Comments:</td><td style="background: #f8f9fa; padding: 10px; border-radius: 4px;">${emailData.comment}</td></tr>` : ''}
              </table>
              <p style="margin-top: 15px; font-style: italic; color: #666;">User has been notified via email.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(adminMailOptions);
      console.log(`Admin notification sent for application ${emailData.applicationId}`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't throw here as admin notification is not critical
    }
  }

  /**
   * Send bulk status update emails
   */
  static async sendBulkStatusUpdates(applications: ApplicationEmailData[]): Promise<void> {
    const promises = applications.map(app => EmailService.sendApplicationStatusUpdate(app));
    await Promise.allSettled(promises);
  }

  /**
   * Send welcome email for new applications
   */
  static async sendWelcomeEmail(emailData: Omit<ApplicationEmailData, 'status'>): Promise<void> {
    const welcomeData: ApplicationEmailData = {
      ...emailData,
      status: 'SUBMITTED' as $Enums.ApplicationCurrentStatus
    };
    
    await EmailService.sendApplicationStatusUpdate(welcomeData);
  }

  /**
   * Test email configuration
   */
  static async testEmailConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log('Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email connection failed:', error);
      return false;
    }
  }
}