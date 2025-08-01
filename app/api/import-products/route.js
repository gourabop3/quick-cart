import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    // Fetch products from the external website
    const response = await fetch('https://quick-cart-beta-bice.vercel.app/api/product/list');
    const data = await response.json();

    if (!data.success || !data.products) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch products from external website" 
      });
    }

    const importedProducts = [];
    const skippedProducts = [];

    // Import each product
    for (const product of data.products) {
      // Check if product already exists
      const existingProduct = await Product.findOne({
        name: product.name,
        offerPrice: product.offerPrice
      });

      if (existingProduct) {
        skippedProducts.push(product.name);
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
      importedProducts.push(product.name);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedProducts.length} products`,
      imported: importedProducts,
      skipped: skippedProducts,
      totalFound: data.products.length
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    });
  }
}