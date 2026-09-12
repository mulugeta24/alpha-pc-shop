require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@alphapcshop.com',
      password: 'admin123',
      phone: '+251911123456',
      role: 'super_admin',
      isVerified: true
    });
    console.log('Super Admin created:', superAdmin.email);

    // Create Regular Admin
    const admin = await User.create({
      name: 'Store Manager',
      email: 'manager@alphapcshop.com',
      password: 'manager123',
      phone: '+251911234567',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin created:', admin.email);

    // Create Sample Products
    const sampleProducts = [
      {
        name: 'Alpha Gaming PC - Ultimate Edition',
        description: 'High-performance gaming PC with the latest components for ultimate gaming experience. Perfect for 4K gaming and content creation.',
        category: 'gaming-pc',
        price: 85000,
        discountPrice: 79999,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i9-13900K',
          ram: '32GB DDR5',
          storage: '2TB NVMe SSD',
          graphics: 'NVIDIA RTX 4080 16GB',
          operatingSystem: 'Windows 11 Pro',
          dimensions: '50cm x 25cm x 55cm',
          ports: ['USB 3.2', 'USB-C', 'HDMI 2.1', 'DisplayPort', 'Ethernet'],
          features: ['RGB Lighting', 'Liquid Cooling', 'Wi-Fi 6E', 'Bluetooth 5.3']
        },
        stock: 15,
        isFeatured: true,
        isNewArrival: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Alpha Gaming PC - Pro Edition',
        description: 'Professional gaming PC with excellent performance for competitive gaming and streaming.',
        category: 'gaming-pc',
        price: 65000,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i7-13700K',
          ram: '16GB DDR5',
          storage: '1TB NVMe SSD',
          graphics: 'NVIDIA RTX 4070 12GB',
          operatingSystem: 'Windows 11 Home',
          dimensions: '45cm x 22cm x 50cm',
          ports: ['USB 3.2', 'USB-C', 'HDMI 2.1', 'DisplayPort', 'Ethernet'],
          features: ['RGB Lighting', 'Air Cooling', 'Wi-Fi 6', 'Bluetooth 5.2']
        },
        stock: 20,
        isFeatured: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Alpha Gaming PC - Starter Edition',
        description: 'Entry-level gaming PC perfect for beginners. Great value for casual gaming.',
        category: 'gaming-pc',
        price: 45000,
        discountPrice: 41999,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i5-13400F',
          ram: '16GB DDR4',
          storage: '512GB NVMe SSD',
          graphics: 'NVIDIA RTX 3060 12GB',
          operatingSystem: 'Windows 11 Home',
          dimensions: '40cm x 20cm x 45cm',
          ports: ['USB 3.0', 'HDMI', 'DisplayPort', 'Ethernet'],
          features: ['RGB Case', 'Air Cooling', 'Wi-Fi 5']
        },
        stock: 25,
        isFeatured: false,
        createdBy: admin._id
      },
      {
        name: 'Alpha Pro Gaming Laptop',
        description: 'Portable gaming powerhouse with high refresh rate display and powerful components.',
        category: 'laptop',
        price: 75000,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i9-13900HX',
          ram: '32GB DDR5',
          storage: '1TB NVMe SSD',
          graphics: 'NVIDIA RTX 4080 12GB',
          display: '17.3" QHD 240Hz',
          operatingSystem: 'Windows 11 Pro',
          weight: '2.8kg',
          dimensions: '39.5cm x 26cm x 2.5cm',
          ports: ['USB 3.2', 'USB-C', 'HDMI 2.1', 'Thunderbolt 4', 'SD Card Reader'],
          features: ['RGB Keyboard', 'Per-key RGB', 'Wi-Fi 6E', 'Bluetooth 5.3', 'Webcam']
        },
        stock: 10,
        isFeatured: true,
        isNewArrival: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Alpha Gaming Laptop - Elite',
        description: 'High-performance gaming laptop with excellent display and cooling system.',
        category: 'laptop',
        price: 55000,
        discountPrice: 51999,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i7-13700HX',
          ram: '16GB DDR5',
          storage: '1TB NVMe SSD',
          graphics: 'NVIDIA RTX 4070 8GB',
          display: '15.6" FHD 165Hz',
          operatingSystem: 'Windows 11 Home',
          weight: '2.4kg',
          dimensions: '35.5cm x 24cm x 2.3cm',
          ports: ['USB 3.2', 'USB-C', 'HDMI 2.1', 'Thunderbolt 4'],
          features: ['RGB Keyboard', 'Wi-Fi 6', 'Bluetooth 5.2', 'Webcam']
        },
        stock: 18,
        isFeatured: true,
        createdBy: admin._id
      },
      {
        name: 'Alpha Gaming Laptop - Core',
        description: 'Mid-range gaming laptop perfect for students and casual gamers.',
        category: 'laptop',
        price: 38000,
        currency: 'ETB',
        images: [],
        specifications: {
          processor: 'Intel Core i5-13420H',
          ram: '16GB DDR4',
          storage: '512GB NVMe SSD',
          graphics: 'NVIDIA RTX 4050 6GB',
          display: '15.6" FHD 144Hz',
          operatingSystem: 'Windows 11 Home',
          weight: '2.2kg',
          dimensions: '35.5cm x 24cm x 2.2cm',
          ports: ['USB 3.0', 'USB-C', 'HDMI', 'Ethernet'],
          features: ['Backlit Keyboard', 'Wi-Fi 6', 'Bluetooth 5.0', 'Webcam']
        },
        stock: 30,
        isFeatured: false,
        createdBy: admin._id
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} sample products created`);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Super Admin:');
    console.log('  Email: admin@alphapcshop.com');
    console.log('  Password: admin123');
    console.log('\nAdmin:');
    console.log('  Email: manager@alphapcshop.com');
    console.log('  Password: manager123');
    console.log('\nPlease change these passwords after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
