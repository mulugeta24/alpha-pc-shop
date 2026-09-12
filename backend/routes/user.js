const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    /\.(jpg|jpeg|png|webp)$/i.test(file.originalname) ? cb(null, true) : cb(new Error('Images only'));
  }
});

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/', protect, authorize('admin', 'super_admin'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'super_admin'), getUserById);
router.put('/:id/role', protect, authorize('super_admin'), updateUserRole);
router.delete('/:id', protect, authorize('super_admin'), deleteUser);

module.exports = router;
