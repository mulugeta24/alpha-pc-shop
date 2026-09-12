const express = require('express');
const router = express.Router();
const { submitContact, getContacts, markAsRead, replyToContact } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public — submit contact form
router.post('/', submitContact);

// Admin — view all messages
router.get('/', protect, authorize('admin', 'super_admin'), getContacts);

// Admin — mark as read
router.put('/:id/read', protect, authorize('admin', 'super_admin'), markAsRead);

// Admin — reply to a message (sends email via Brevo)
router.post('/:id/reply', protect, authorize('admin', 'super_admin'), replyToContact);

module.exports = router;
