const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: { id: contact._id },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { contacts } });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Mark a contact message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, data: { contact } });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Reply to a contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
exports.replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const senderName = process.env.BREVO_SENDER_NAME || 'Alpha PC Shop';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'bereketmillion8@gmail.com';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:10px;line-height:44px;font-size:22px;font-weight:bold;color:#fff;margin-bottom:10px;">A</div>
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">Alpha PC Shop</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:15px;color:#555;">Hello <strong>${contact.name}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#888;">
              This is a reply to your message regarding: <em>${contact.subject}</em>
            </p>

            <!-- Reply box -->
            <div style="background:#f8f8fb;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0;font-size:15px;color:#333;white-space:pre-wrap;line-height:1.7;">${replyMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>

            <!-- Original message -->
            <div style="background:#f0f0f5;border-radius:8px;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:1px;">Your original message</p>
              <p style="margin:0;font-size:13px;color:#666;white-space:pre-wrap;line-height:1.6;">${contact.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8fb;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ee;">
            <p style="margin:0 0 4px;font-size:12px;color:#888;">${senderName} &mdash; Addis Ababa, Ethiopia</p>
            <p style="margin:0 0 4px;font-size:12px;color:#888;">Phone: +251 960 286 319 &nbsp;|&nbsp; Email: ${senderEmail}</p>
            <p style="margin:0;font-size:11px;color:#aaa;">&copy; ${new Date().getFullYear()} Alpha PC Shop. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const result = await sendEmail(
      contact.email,
      `Re: ${contact.subject} – Alpha PC Shop`,
      htmlContent
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to send email: ' + result.error });
    }

    // Mark as replied
    contact.status = 'replied';
    await contact.save();

    res.json({ success: true, message: 'Reply sent successfully', data: { contact } });
  } catch (error) {
    console.error('Reply contact error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending reply' });
  }
};
