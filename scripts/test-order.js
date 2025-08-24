import connectDB from "../config/db.js";
import Order from "../models/Order.js";

async function testOrderCreation() {
  try {
    await connectDB();
    
    console.log("Testing order creation...");
    
    // Test single order creation
    const testOrder = new Order({
      userId: "test-user-123",
      items: [
        {
          product: "test-product-123",
          quantity: 2
        }
      ],
      amount: 100,
      address: "test-address-123",
      date: Date.now()
    });
    
    const savedOrder = await testOrder.save();
    console.log("✅ Single order created successfully:");
    console.log("Order ID:", savedOrder.orderId);
    console.log("MongoDB ID:", savedOrder._id);
    
    // Test multiple orders creation
    const testOrders = [
      {
        userId: "test-user-456",
        items: [{ product: "test-product-456", quantity: 1 }],
        amount: 50,
        address: "test-address-456",
        date: Date.now()
      },
      {
        userId: "test-user-789",
        items: [{ product: "test-product-789", quantity: 3 }],
        amount: 150,
        address: "test-address-789",
        date: Date.now()
      }
    ];
    
    const savedOrders = await Order.insertMany(testOrders);
    console.log("\n✅ Multiple orders created successfully:");
    savedOrders.forEach((order, index) => {
      console.log(`Order ${index + 1} ID:`, order.orderId);
    });
    
    // Clean up test data
    await Order.deleteMany({ userId: { $in: ["test-user-123", "test-user-456", "test-user-789"] } });
    console.log("\n✅ Test data cleaned up");
    
    console.log("\n🎉 All tests passed! Order creation is working properly.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testOrderCreation();