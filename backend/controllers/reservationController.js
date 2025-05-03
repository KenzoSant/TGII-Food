import Reservation from '../models/reservationModel.js';
import userModel from '../models/userModel.js';

// Criar nova reserva (requer autenticação)
 const createReservation = async (req, res) => {
  try {
    // Verificação adicional dos dados
    if (!req.body.date || !req.body.time || !req.body.people) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos para a reserva"
      });
    }

    const reservation = new Reservation({
      userId: req.user.id, // Associando ao usuário logado
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
    
    return res.status(201).json({
      success: true,
      message: "Reserva criada com sucesso",
      data: reservation
    });
    
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar reserva",
      error: error.message
    });
  }
};

// Obter todas as reservas (apenas admin)
 const getReservations = async (req, res) => {
  try {
    // Busca todas as reservas com informações do usuário
    const reservations = await Reservation.find({})
      .populate('userId', 'name email') // Popula dados do usuário
      .sort({ date: 1, time: 1 });

    res.json({ 
      success: true,
      data: reservations 
    });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar reservas",
      error: error.message 
    });
  }
};

// Atualizar status da reserva (apenas admin)
 const updateReservation = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'rejected', 'canceled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Status inválido" 
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!reservation) {
      return res.status(404).json({ 
        success: false,
        message: "Reserva não encontrada" 
      });
    }

    res.json({ 
      success: true,
      message: "Status da reserva atualizado",
      data: reservation 
    });
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao atualizar reserva",
      error: error.message 
    });
  }
};

 const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id })
      .sort({ date: 1, time: 1 });

    res.json({ 
      success: true,
      data: reservations 
    });
  } catch (error) {
    console.error("Erro ao buscar reservas do usuário:", error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar reservas",
      error: error.message 
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user.id,
        status: 'pending' // Só pode cancelar se estiver pendente
      },
      { status: 'canceled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ 
        success: false,
        message: "Reserva não encontrada ou não pode ser cancelada" 
      });
    }

    res.json({ 
      success: true,
      message: "Reserva cancelada com sucesso",
      data: reservation 
    });
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao cancelar reserva",
      error: error.message 
    });
  }
};

export {  createReservation, getReservations, updateReservation, cancelReservation, getUserReservations};