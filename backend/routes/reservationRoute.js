import express from "express";
import { createReservation, getReservations, updateReservation } from "../controllers/reservationController.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js"; // Novo middleware

const router = express.Router();

// Rota pública para criação de reservas
router.post("/", authMiddleware, createReservation); 

// Rotas protegidas para admin
router.get("/", authMiddleware, adminMiddleware, getReservations);
router.put("/:id", authMiddleware, adminMiddleware, updateReservation);

export default router;