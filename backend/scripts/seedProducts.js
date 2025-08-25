const mongoose = require('mongoose');
const Product = require('../dist/models/Product').default;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/teamwave', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleProducts = [
  {
    name: 'TeamWave Official Jersey',
    description: 'Official team jersey with embroidered logo and sponsored branding. Made from high-quality breathable fabric.',
    category: 'jerseys',
    price: 89.99,
    image: '/test-image.jpg',
    stock: 25,
    rating: 4.8,
  },
  {
    name: 'Gaming Mouse Pad XL',
    description: 'Extra large gaming mouse pad with TeamWave logo. Perfect for competitive gaming with smooth tracking surface.',
    category: 'accessories',
    price: 34.99,
    image: '/test-image.jpg',
    stock: 50,
    rating: 4.6,
  },
  {
    name: 'TeamWave Snapback Cap',
    description: 'Stylish snapback cap with embroidered TeamWave logo. Adjustable fit for maximum comfort.',
    category: 'accessories',
    price: 29.99,
    image: '/test-image.jpg',
    stock: 35,
    rating: 4.7,
  },
  {
    name: 'LED Gaming Keyboard',
    description: 'Mechanical gaming keyboard with custom TeamWave keycaps and RGB lighting. Perfect for competitive gaming.',
    category: 'peripherals',
    price: 149.99,
    image: '/test-image.jpg',
    stock: 10,
    rating: 4.9,
  },
  {
    name: 'TeamWave Hoodie',
    description: 'Comfortable hoodie with TeamWave branding. Perfect for casual wear and showing team support.',
    category: 'jerseys',
    price: 59.99,
    image: '/test-image.jpg',
    stock: 20,
    rating: 4.5,
  },
  {
    name: 'Gaming Headset Pro',
    description: 'Professional gaming headset with noise cancellation and crystal clear audio. TeamWave edition.',
    category: 'peripherals',
    price: 129.99,
    image: '/test-image.jpg',
    stock: 15,
    rating: 4.8,
  },
];

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Display the products
    insertedProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.price} DT (${product.category})`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
  }
};

seedProducts();
