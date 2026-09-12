const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['gaming-pc', 'laptop']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: null,
    min: [0, 'Discount price cannot be negative']
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  images: [{
    public_id: String,
    url: String,
    alt: String
  }],
  specifications: {
    processor: {
      type: String,
      required: true
    },
    ram: {
      type: String,
      required: true
    },
    storage: {
      type: String,
      required: true
    },
    graphics: {
      type: String,
      required: true
    },
    display: {
      type: String,
      required: function() {
        return this.category === 'laptop';
      }
    },
    operatingSystem: {
      type: String,
      default: 'Windows 11'
    },
    weight: {
      type: String,
      required: function() {
        return this.category === 'laptop';
      }
    },
    dimensions: {
      type: String
    },
    ports: [String],
    features: [String]
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
