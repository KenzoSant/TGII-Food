import Reservation from '../models/reservationModel.js';

const createReservation = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const reservation = new Reservation({
            customerName: req.body.customerName,
            email: req.body.email,
            phone: req.body.phone,
            date: new Date(req.body.date),
            time: req.body.time,
            people: req.body.people,
            notes: req.body.notes || "",
            status: "pending",
            user: req.user._id // Associate reservation with user
        });

        await reservation.save();
        
        return res.status(201).json({
            success: true,
            message: "Reserva criada com sucesso",
            data: reservation
        });
        
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            success: false,
            message: "Erro ao criar reserva",
            error: error.message
        });
    }
};
  

// Obter todas as reservas
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar status da reserva
const updateReservation = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {  createReservation, getReservations, updateReservation, };