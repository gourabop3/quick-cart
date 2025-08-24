import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      // Generate a unique order ID with timestamp and random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `ORD-${timestamp}-${randomStr}`;
    }
  },
  userId: { type: String, required: true, ref: "user" },
  items: [
    {
      product: { type: String, required: true, ref: "product" },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: "address" },
  status: { type: String, required: true, default: "Order Placed" },
  date: { type: Number, required: true },
});

// Pre-save middleware to ensure orderId is always set
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    this.orderId = `ORD-${timestamp}-${randomStr}`;
  }
  next();
});

// Pre-insertMany middleware to ensure all documents have orderId
orderSchema.pre('insertMany', function(next, docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc, index) => {
      if (!doc.orderId) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const batchIndex = index.toString().padStart(2, '0');
        doc.orderId = `ORD-${timestamp}-${batchIndex}-${randomStr}`;
      }
    });
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("order", orderSchema);

export default Order;
