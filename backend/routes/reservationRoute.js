import express from "express";
import { createReservation, getReservations, updateReservation } from "../controllers/reservationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Rota pública para criação de reservas
router.post("/", createReservation); 

// Rotas protegidas para admin
router.get("/", authMiddleware, getReservations);
router.put("/:id", authMiddleware, updateReservation);

export default router;