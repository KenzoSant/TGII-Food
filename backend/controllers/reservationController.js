import Reservation from "../models/reservation.Model";

export const createReservation = async (req, res) => {
  try {
    console.log("Recebendo dados da reserva:", req.body); // Log para debug
    
    const reservation = new Reservation({
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone,
      date: new Date(req.body.date),
      time: req.body.time,
      people: req.body.people,
      notes: req.body.notes,
      status: 'pending' // Definindo status padrão
    });

    await reservation.save();
    
    console.log("Reserva criada com sucesso:", reservation); // Log para debug
    
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Erro ao criar reserva:", error); // Log para debug
    res.status(400).json({ 
      success: false,
      message: "Erro ao criar reserva",
      error: error.message 
    });
  }
};