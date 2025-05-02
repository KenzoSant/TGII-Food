import Reservation from '../models/reservationModel.js';

// Criar nova reserva

export const createReservation = async (req, res) => {
    console.log("Rota /api/reservations alcançada"); // Debug
    
    // Verifique se o Mongoose está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "Database not connected"
      });
    }
  
    try {
      console.log("Dados recebidos:", req.body);
      
      const reservation = new Reservation({
        customerName: req.body.customerName,
        email: req.body.email,
        phone: req.body.phone,
        date: new Date(req.body.date),
        time: req.body.time,
        people: req.body.people,
        notes: req.body.notes || "",
        status: "pending"
      });
  
      await reservation.save();
      
      console.log("Reserva salva no MongoDB:", reservation);
      
      return res.status(201).json({
        success: true,
        message: "Reserva criada com sucesso",
        data: reservation
      });
      
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        stack: error.stack
      });
      
      return res.status(400).json({
        success: false,
        message: "Erro ao criar reserva",
        error: error.message
      });
    }
  };
  

// Obter todas as reservas
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar status da reserva
export const updateReservation = async (req, res) => {
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