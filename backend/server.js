import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reservationRouter from "./routes/reservationRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

//middlewares
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// Adicione antes das outras rotas
app.post('/api/test-connection', async (req, res) => {
  try {
    const testDoc = new Reservation({
      customerName: "Teste",
      email: "teste@teste.com",
      phone: "11999999999",
      date: new Date(),
      time: "19:00",
      people: 2
    });
    
    await testDoc.save();
    
    res.json({
      success: true,
      message: "Teste de conexão bem-sucedido",
      data: testDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro no teste de conexão",
      error: error.message
    });
  }
});

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use('/api/reservations', reservationRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
});
