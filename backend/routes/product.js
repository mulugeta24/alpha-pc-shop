const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin', 'super_admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProduct);

module.exports = router;
