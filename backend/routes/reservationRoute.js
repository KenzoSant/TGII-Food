import express from "express";
import { 
  createReservation, 
  getReservations, 
  updateReservation, 
  cancelReservation, 
  getUserReservations 
} from "../controllers/reservationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Rota para criar reserva
router.post("/", authMiddleware, createReservation); 

// Rota para obter reservas do usuário logado
router.get("/myreservations", authMiddleware, getUserReservations);

// Rotas para admin
router.get("/reservations", authMiddleware, getReservations);
router.put("/:id", authMiddleware, updateReservation);
router.put("/:id/cancel", authMiddleware, cancelReservation);

export default router;