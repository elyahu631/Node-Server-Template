// config/email.ts
import nodemailer from 'nodemailer';
import { vars } from './vars';

const { emailHost, emailPort, emailUsername, emailPassword } = vars;

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string; 
}

//  reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465, // true for 465, false for other ports
  auth: {
    user: emailUsername,
    pass: emailPassword,
  },
});

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: 'Elyahu Anavi <hello@ely.io>', 
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    // Check if error is an instance of Error and has a message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send email to ${options.email}:`, errorMessage);
  
    // Throw a new error with the appropriate message
    throw new Error(`Email sending failed: ${errorMessage}`);
  }
  
};

export default sendEmail;
