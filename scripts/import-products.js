const axios = require('axios');
const connectDB = require('../config/db.js');
const Product = require('../models/Product.js');

// Function to scrape products from the website
async function scrapeProducts() {
  try {
    console.log('Fetching products from https://quick-cart-beta-bice.vercel.app...');
    
    // Fetch from their API endpoint
    const productsResponse = await axios.get('https://quick-cart-beta-bice.vercel.app/api/product/list');
    
    if (productsResponse.data && productsResponse.data.products) {
      console.log(`Found ${productsResponse.data.products.length} products from API`);
      return productsResponse.data.products;
    } else {
      console.log('No products found in API response, creating sample products...');
      return createSampleProducts();
    }
    
  } catch (error) {
    console.error('Error scraping products:', error.message);
    console.log('Creating sample products instead...');
    return createSampleProducts();
  }
}

// Function to create sample products based on typical e-commerce data
function createSampleProducts() {
  const sampleProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation and long battery life",
      price: 199.99,
      offerPrice: 149.99,
      image: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
      category: "Electronics",
      date: Date.now(),
      userId: "sample-seller-1"
    },
    {
      name: "Smart Fitness Watch",
      description: "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring",
      price: 299.99,
      offerPrice: 249.99,
      image: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
      category: "Electronics",
      date: Date.now(),
      userId: "sample-seller-1"
    },
    {
      name: "Organic Cotton T-Shirt",
      description: "Comfortable and eco-friendly cotton t-shirt available in multiple colors",
      price: 29.99,
      offerPrice: 24.99,
      image: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
      category: "Clothing",
      date: Date.now(),
      userId: "sample-seller-2"
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Keep your drinks cold for 24 hours with this premium insulated water bottle",
      price: 39.99,
      offerPrice: 34.99,
      image: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"],
      category: "Home & Garden",
      date: Date.now(),
      userId: "sample-seller-3"
    },
    {
      name: "Wireless Charging Pad",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices",
      price: 49.99,
      offerPrice: 39.99,
      image: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400"],
      category: "Electronics",
      date: Date.now(),
      userId: "sample-seller-1"
    },
    {
      name: "Yoga Mat",
      description: "Non-slip yoga mat perfect for home workouts and meditation",
      price: 34.99,
      offerPrice: 29.99,
      image: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"],
      category: "Sports",
      date: Date.now(),
      userId: "sample-seller-4"
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "Waterproof portable speaker with 360-degree sound and 20-hour battery life",
      price: 89.99,
      offerPrice: 69.99,
      image: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"],
      category: "Electronics",
      date: Date.now(),
      userId: "sample-seller-1"
    },
    {
      name: "Ceramic Coffee Mug Set",
      description: "Set of 4 beautiful ceramic coffee mugs, perfect for your morning brew",
      price: 24.99,
      offerPrice: 19.99,
      image: ["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400"],
      category: "Home & Garden",
      date: Date.now(),
      userId: "sample-seller-3"
    },
    {
      name: "LED Desk Lamp",
      description: "Adjustable LED desk lamp with touch control and multiple brightness levels",
      price: 59.99,
      offerPrice: 49.99,
      image: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"],
      category: "Home & Garden",
      date: Date.now(),
      userId: "sample-seller-3"
    },
    {
      name: "Wireless Gaming Mouse",
      description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons",
      price: 79.99,
      offerPrice: 64.99,
      image: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"],
      category: "Electronics",
      date: Date.now(),
      userId: "sample-seller-1"
    }
  ];
  
  return sampleProducts;
}

// Function to import products into the database
async function importProducts() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Scraping products...');
    const products = await scrapeProducts();
    
    console.log(`Found ${products.length} products to import`);
    
    // Import each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Check if product already exists (by name and price to avoid duplicates)
      const existingProduct = await Product.findOne({
        name: product.name,
        offerPrice: product.offerPrice
      });
      
      if (existingProduct) {
        console.log(`Product "${product.name}" already exists, skipping...`);
        continue;
      }
      
      // Create new product
      const newProduct = new Product({
        userId: product.userId || "imported-seller",
        name: product.name,
        description: product.description,
        price: product.price,
        offerPrice: product.offerPrice,
        image: product.image,
        category: product.category,
        date: product.date || Date.now()
      });
      
      await newProduct.save();
      console.log(`Imported: ${product.name}`);
    }
    
    console.log('Product import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error importing products:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();