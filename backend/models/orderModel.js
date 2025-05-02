import mongoose from "mongoose";

// orderModel.js
const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  amount: { type: Number, required: true },
  address: { 
    type: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
      phone: String,
      email: String,
      firstName: String
    },
    required: function() { return this.diningOption === 'delivery'; }
  },
  tableNumber: { type: String },
  diningOption: { 
    type: String, 
    enum: ['delivery', 'dine-in'],
    required: true 
  },
  status: { type: String, default: "Preparando" },
  payment: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.models.Order || mongoose.model("Order", orderSchema);