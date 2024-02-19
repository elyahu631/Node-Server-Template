import nodemailer from 'nodemailer';
import { vars} from '../config/vars';

const { emailHost, emailPort, emailUsername, emailPassword } = vars;

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Create a transporter with SMTP configuration
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    auth: {
      user: emailUsername,
      pass: emailPassword,
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'Elyahu Anavi <hello@ely.io>', // Customize with your sender details
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email using the configured transporter
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
