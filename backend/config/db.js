import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      console.log("Tentando conectar ao MongoDB...");
      await mongoose.connect('mongodb+srv://KenzoTK:Toka%40025@cluster0.walrf.mongodb.net/restaurant').then(()=>console.log("DB Connected"));
      console.log("Conectado ao MongoDB com sucesso!");
      
      // Verifique se a collection existe
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("Collections disponíveis:", collections.map(c => c.name));
    } catch (error) {
      console.error("Erro na conexão com MongoDB:", error);
      process.exit(1);
    }
  };
