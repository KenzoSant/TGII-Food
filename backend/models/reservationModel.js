import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  people: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Esta linha cria a collection no MongoDB
export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);