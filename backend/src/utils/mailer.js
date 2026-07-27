const nodemailer = require("nodemailer");

const createTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: {
      user,
      pass,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();
    const fromName = "Snacko Instant Delivery";
    const fromEmail = process.env.SMTP_USER || "no-reply@snacko.com";

    if (!transporter) {
      console.log(`\n==================================================`);
      console.log(`[MAIL SIMULATION] FROM: "${fromName}" <${fromEmail}>`);
      console.log(`[MAIL SIMULATION] TO: ${to}`);
      console.log(`[MAIL SIMULATION] SUBJECT: ${subject}`);
      console.log(`[MAIL SIMULATION] BODY (TEXT): ${text || "HTML content"}`);
      console.log(`==================================================\n`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error("Failed to send email via nodemailer:", error.message);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = "Welcome to Snacko! 🍿 Instant Snacking Bliss";
  const text = `Hi ${userName},\n\nWelcome to Snacko! We are thrilled to have you onboard. Get ready to experience lightning-fast 15-minute grocery and snack delivery right to your doorstep.\n\nHappy Snacking,\nTeam Snacko`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #f97316; margin: 0; font-size: 28px;">Welcome to Snacko! 🍿</h1>
      </div>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Welcome to Snacko! We're absolutely thrilled to have you join our community.
      </p>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Whether you are craving late-night potato chips, need fresh milk in the morning, or want a cold soda instantly, we've got you covered with delivery from our local dark store in just **15-20 minutes**.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5174" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Start Snacking Now</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        &copy; 2026 Snacko Inc. Sector 45, Gurugram, Haryana.
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

const sendPasswordResetEmail = async (userEmail, code) => {
  const subject = "Snacko Account - Password Reset Verification Code";
  const text = `Hello,\n\nYou requested a password reset for your Snacko account. Your 6-digit verification code is:\n\n${code}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nTeam Snacko`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #f97316; margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello,</p>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        We received a request to reset the password for your Snacko account. Use the following verification code to proceed:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 5px; border-radius: 8px;">
          ${code}
        </div>
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
        This code is valid for **10 minutes**. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        &copy; 2026 Snacko Inc. Sector 45, Gurugram, Haryana.
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

const sendOrderConfirmationEmail = async (orderId, userEmail, userName, amount, paymentMethod, items) => {
  const subject = `Order Confirmed! #${orderId} - Snacko Delivery 🛵`;
  
  let itemsListText = "";
  let itemsListHtml = "";

  if (items && items.length > 0) {
    items.forEach(item => {
      itemsListText += `- ${item.product_name} x ${item.quantity} (₹${item.price})\n`;
      itemsListHtml += `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">${item.product_name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: bold; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `;
    });
  }

  const text = `Hi ${userName},\n\nYour order #${orderId} has been successfully received and is being packed at our dark store!\n\nOrder Details:\nTotal Amount: ₹${amount}\nPayment Method: ${paymentMethod}\n\nItems:\n${itemsListText}\n\nOur delivery partner will reach your address in 15-20 minutes.\n\nThank you for ordering with Snacko!\nTeam Snacko`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
        <span style="color: #f97316; font-size: 28px; font-weight: bold;">Snacko</span>
        <h2 style="color: #1e293b; margin: 5px 0 0 0; font-size: 18px;">Order Confirmation</h2>
      </div>
      
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Your order has been placed successfully! Our dark store team is already packing your items.
      </p>

      <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">ORDER ID</div>
        <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 12px;">#${orderId}</div>
        
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">PAYMENT METHOD</div>
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 12px;">${paymentMethod}</div>
      </div>

      <h3 style="color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; color: #64748b; font-size: 12px;">Product</th>
            <th style="text-align: center; padding-bottom: 8px; color: #64748b; font-size: 12px; width: 60px;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px; color: #64748b; font-size: 12px; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
          <tr>
            <td colspan="2" style="padding-top: 15px; font-size: 14px; color: #475569; font-weight: bold;">Grand Total</td>
            <td style="padding-top: 15px; font-size: 16px; color: #f97316; font-weight: bold; text-align: right;">₹${amount}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 12px; text-align: center; color: #c2410c; font-size: 13px; font-weight: bold; margin-bottom: 20px;">
        🛵 Est. Delivery Time: 15 - 20 Minutes
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Thank you for choosing Snacko!
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
