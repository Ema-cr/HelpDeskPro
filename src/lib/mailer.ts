import nodemailer from 'nodemailer';
import { Ticket, Comment } from '@/types';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.EMAIL_FROM || 'ricardojarrison@gmail.com';

// Send ticket created email
export async function sendTicketCreatedEmail(ticket: any) {
  try {
    const clientEmail = typeof ticket.createdBy === 'object' 
      ? ticket.createdBy.email 
      : ticket.email;
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Ticket Created: ${ticket.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Ticket Created Successfully</h2>
          <p>Your support ticket has been created and our team will review it shortly.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Description:</strong> ${ticket.description}</p>
            <p><strong>Priority:</strong> <span style="text-transform: uppercase;">${ticket.priority}</span></p>
            <p><strong>Status:</strong> <span style="text-transform: uppercase;">${ticket.status}</span></p>
          </div>
          
          <p>You can view and track your ticket at:</p>
          <a href="${APP_URL}/client/ticket/${ticket._id}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            View Ticket
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using HelpDeskPro!
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Ticket created email sent to:', clientEmail);
  } catch (error) {
    console.error('❌ Error sending ticket created email:', error);
    throw error;
  }
}

// Send comment added email
export async function sendCommentAddedEmail(ticket: any, comment: any) {
  try {
    const clientEmail = typeof ticket.createdBy === 'object' 
      ? ticket.createdBy.email 
      : ticket.email;
    
    const authorName = typeof comment.author === 'object' 
      ? comment.author.name 
      : 'Support Agent';
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `New Response: ${ticket.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Response to Your Ticket</h2>
          <p>A support agent has responded to your ticket.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Ticket: ${ticket.title}</h3>
            <p><strong>From:</strong> ${authorName}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${comment.message}</p>
          </div>
          
          <p>View the full conversation:</p>
          <a href="${APP_URL}/client/ticket/${ticket._id}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            View Ticket
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using HelpDeskPro!
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Comment added email sent to:', clientEmail);
  } catch (error) {
    console.error('❌ Error sending comment added email:', error);
    throw error;
  }
}

// Send ticket closed email
export async function sendTicketClosedEmail(ticket: any) {
  try {
    const clientEmail = typeof ticket.createdBy === 'object' 
      ? ticket.createdBy.email 
      : ticket.email;
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Ticket Closed: ${ticket.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Ticket Closed</h2>
          <p>Your support ticket has been closed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Status:</strong> CLOSED</p>
          </div>
          
          <p>We hope we were able to resolve your issue. If you need further assistance, please create a new ticket.</p>
          
          <a href="${APP_URL}/client/ticket/${ticket._id}" 
             style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            View Ticket
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using HelpDeskPro!
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Ticket closed email sent to:', clientEmail);
  } catch (error) {
    console.error('❌ Error sending ticket closed email:', error);
    throw error;
  }
}

// Send reminder email to agents
export async function sendReminderEmail(agentEmail: string, tickets: any[]) {
  try {
    const ticketList = tickets.map(ticket => `
      <li style="margin: 10px 0;">
        <strong>${ticket.title}</strong> (Priority: ${ticket.priority})<br/>
        Created: ${new Date(ticket.createdAt).toLocaleDateString()}<br/>
        <a href="${APP_URL}/agent/ticket/${ticket._id}">View Ticket</a>
      </li>
    `).join('');
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: agentEmail,
      subject: `Reminder: ${tickets.length} Ticket(s) Pending Response`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Tickets Pending Response</h2>
          <p>You have ${tickets.length} ticket(s) that need your attention:</p>
          
          <ul style="list-style: none; padding: 0;">
            ${ticketList}
          </ul>
          
          <a href="${APP_URL}/agent" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            View Dashboard
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            HelpDeskPro Automated Reminder
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Reminder email sent to:', agentEmail);
  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
    throw error;
  }
}
