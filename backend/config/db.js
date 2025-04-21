import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://KenzoTK:Toka%40025@cluster0.walrf.mongodb.net/restaurant').then(()=>console.log("DB Connected"));
}

