import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  people: { type: Number, required: true },
  notes: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'canceled'],
    default: 'pending'
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);