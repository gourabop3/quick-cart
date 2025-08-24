import connectDB from "../config/db.js";
import Order from "../models/Order.js";

async function fixOrders() {
  try {
    await connectDB();
    
    // Find all orders with null or missing orderId
    const ordersToFix = await Order.find({ 
      $or: [
        { orderId: null },
        { orderId: { $exists: false } }
      ]
    });
    
    console.log(`Found ${ordersToFix.length} orders to fix`);
    
    // Update each order with a unique orderId
    for (let i = 0; i < ordersToFix.length; i++) {
      const order = ordersToFix[i];
      const timestamp = order.date || Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);
      const index = i.toString().padStart(3, '0');
      
      const newOrderId = `ORD-${timestamp}-${index}-${randomSuffix}`;
      
      await Order.findByIdAndUpdate(order._id, {
        orderId: newOrderId
      });
      
      console.log(`Fixed order ${order._id} with orderId: ${newOrderId}`);
    }
    
    console.log('All orders have been fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing orders:', error);
    process.exit(1);
  }
}

fixOrders();