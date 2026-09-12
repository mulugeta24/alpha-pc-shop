const Brevo = require('@getbrevo/brevo');

let apiInstance = null;

if (process.env.BREVO_API_KEY) {
  try {
    apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
    console.log('Brevo email service initialized');
  } catch (error) {
    console.log('Brevo API not configured, email features will be disabled');
    apiInstance = null;
  }
} else {
  console.log('Brevo API not configured, email features will be disabled');
}

const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  if (!apiInstance) {
    console.log('Email service not available');
    return { success: false, error: 'Email service not configured' };
  }
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@alphapcshop.com',
      name: process.env.BREVO_SENDER_NAME || 'Alpha PC Shop'
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    if (textContent) sendSmtpEmail.textContent = textContent;
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, result };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

/* ─── Shared layout wrapper ─────────────────────────────────────────────── */
const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Alpha PC Shop</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;line-height:48px;text-align:center;font-size:24px;font-weight:bold;color:#fff;margin-bottom:12px;">A</div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Alpha PC Shop</h1>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Your Premium Gaming Hardware Store in Ethiopia</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8fb;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ee;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;">Alpha PC Shop &mdash; Addis Ababa, Ethiopia</p>
              <p style="margin:0 0 6px;font-size:12px;color:#888;">Phone: +251 960 286 319 &nbsp;|&nbsp; Email: info@alphapcshop.com</p>
              <p style="margin:0;font-size:11px;color:#aaa;">&copy; ${new Date().getFullYear()} Alpha PC Shop. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/* ─── OTP Email ─────────────────────────────────────────────────────────── */
const sendOTPEmail = async (to, otp) => {
  const subject = 'Verify Your Email – Alpha PC Shop';

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Verify Your Email Address</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
      Thank you for creating an account with <strong>Alpha PC Shop</strong>. To complete your registration, please use the verification code below.
    </p>

    <!-- OTP Box -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:28px 48px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
            <p style="margin:0;font-size:42px;font-weight:800;color:#ffffff;letter-spacing:10px;">${otp}</p>
          </div>
        </td>
      </tr>
    </table>

    <table cellpadding="0" cellspacing="0" width="100%" style="background:#fff8e1;border-radius:8px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#b45309;">
            ⏱ &nbsp;This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.6;">
      If you did not create an account, you can safely ignore this email.
    </p>
    <p style="margin:0;font-size:14px;color:#555;">
      Need help? Contact us at <a href="mailto:info@alphapcshop.com" style="color:#6366f1;text-decoration:none;">info@alphapcshop.com</a>.
    </p>
  `;

  return await sendEmail(to, subject, emailWrapper(body));
};

/* ─── Password Reset Email ──────────────────────────────────────────────── */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = 'Reset Your Password – Alpha PC Shop';

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Password Reset Request</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
      We received a request to reset the password for your Alpha PC Shop account. Click the button below to choose a new password.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">
            Reset My Password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#888;">Or copy and paste this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
      <a href="${resetUrl}" style="color:#6366f1;text-decoration:none;">${resetUrl}</a>
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="background:#fff0f0;border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#b91c1c;">
            ⚠️ &nbsp;This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your password will remain unchanged.
          </p>
        </td>
      </tr>
    </table>
  `;

  return await sendEmail(to, subject, emailWrapper(body));
};

/* ─── Order Confirmation Email ──────────────────────────────────────────── */
const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const subject = `Order Confirmed #${orderDetails._id.toString().slice(-8).toUpperCase()} – Alpha PC Shop`;

  const deliveryLabel = orderDetails.deliveryType === 'pickup'
    ? '🏪 Store Pickup'
    : '🚚 Home Delivery';

  const itemRows = orderDetails.orderItems.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:48px;vertical-align:top;padding-right:12px;">
              ${item.image
                ? `<img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:6px;object-fit:cover;" />`
                : `<div style="width:48px;height:48px;background:#e8e8ee;border-radius:6px;"></div>`
              }
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1a1a2e;">${item.name}</p>
              <p style="margin:0;font-size:13px;color:#888;">Qty: ${item.quantity} &times; ETB ${item.price.toLocaleString()}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a2e;">ETB ${(item.price * item.quantity).toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const body = `
    <!-- Success banner -->
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f0fdf4;border-radius:10px;margin:0 0 28px;">
      <tr>
        <td style="padding:20px 24px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:28px;padding-right:12px;">✅</td>
              <td>
                <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:#15803d;">Payment Confirmed!</p>
                <p style="margin:0;font-size:13px;color:#166534;">Your order has been received and is being processed.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#1a1a2e;">Order Summary</h2>

    <!-- Order meta -->
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8f8fb;border-radius:8px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size:13px;color:#888;padding-bottom:6px;">Order ID</td>
              <td style="font-size:13px;font-weight:600;color:#1a1a2e;text-align:right;padding-bottom:6px;">#${orderDetails._id.toString().slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;padding-bottom:6px;">Date</td>
              <td style="font-size:13px;font-weight:600;color:#1a1a2e;text-align:right;padding-bottom:6px;">${new Date(orderDetails.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;">Delivery Method</td>
              <td style="font-size:13px;font-weight:600;color:#1a1a2e;text-align:right;">${deliveryLabel}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Items -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
      ${itemRows}
    </table>

    <!-- Totals -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#555;">Subtotal</td>
        <td style="padding:6px 0;font-size:13px;color:#555;text-align:right;">ETB ${orderDetails.itemsPrice.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#555;">Delivery Fee</td>
        <td style="padding:6px 0;font-size:13px;color:#555;text-align:right;">${orderDetails.shippingPrice === 0 ? 'Free (Pickup)' : `ETB ${orderDetails.shippingPrice.toLocaleString()}`}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1a1a2e;border-top:2px solid #e8e8ee;">Total Paid</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#6366f1;text-align:right;border-top:2px solid #e8e8ee;">ETB ${orderDetails.totalPrice.toLocaleString()}</td>
      </tr>
    </table>

    ${orderDetails.deliveryType === 'pickup' ? `
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#eff6ff;border-radius:8px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1d4ed8;">📍 Pickup Location</p>
          <p style="margin:0;font-size:13px;color:#1e40af;">Alpha PC Shop, Bole Sub-City, Addis Ababa, Ethiopia<br/>We will notify you when your order is ready for pickup.</p>
        </td>
      </tr>
    </table>` : ''}

    <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
      Questions about your order? Contact us at
      <a href="mailto:info@alphapcshop.com" style="color:#6366f1;text-decoration:none;">info@alphapcshop.com</a>
      or call <strong>+251 960 286 319</strong>.
    </p>
  `;

  return await sendEmail(to, subject, emailWrapper(body));
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail
};
