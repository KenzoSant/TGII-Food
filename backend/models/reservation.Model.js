import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Formato "HH:MM"
  people: { type: Number, required: true, min: 1, max: 12 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);