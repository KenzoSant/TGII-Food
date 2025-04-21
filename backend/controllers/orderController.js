import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import mongoose from "mongoose";

const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL?.trim() || "https://tgii-food-front.onrender.com";

  try {
    console.log("Dados recebidos:", req.body);

    // Validações iniciais
    if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ success: false, message: "ID de usuário inválido" });
    }

    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ success: false, message: "Nenhum item no pedido" });
    }

    if (req.body.diningOption === 'dine-in' && !req.body.tableNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Número da mesa é obrigatório para pedidos no local" 
      });
    }

    // Criação do pedido
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      amount: Number(req.body.amount),
      diningOption: req.body.diningOption,
      ...(req.body.diningOption === 'dine-in' && { tableNumber: req.body.tableNumber }),
      ...(req.body.diningOption === 'delivery' && { address: req.body.address }),
      status: "Food Processing",
      payment: false
    });

    await newOrder.save();
    console.log("Pedido criado no banco de dados:", newOrder);

    // Preparação do Stripe
    const line_items = req.body.items.map((item) => {
      const unitAmount = Math.round(Number(item.price) * 100);
      if (isNaN(unitAmount)) {
        throw new Error(`Preço inválido para o item: ${item.name}`);
      }
      return {
        price_data: {
          currency: "brl",
          product_data: { name: item.name },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    if (req.body.diningOption === 'delivery') {
      line_items.push({
        price_data: {
          currency: "brl",
          product_data: { name: "Taxa de Entrega" },
          unit_amount: 2 * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}&diningOption=${req.body.diningOption}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        tableNumber: req.body.tableNumber || 'N/A'
      }
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao processar pedido",
      error: error.message 
    });
  }
};

// orderController.js
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      
      // Sempre limpa o carrinho após pagamento bem-sucedido
      await userModel.findByIdAndUpdate(order.userId, { $set: { cartData: {} } });

      return res.json({ 
        success: true, 
        message: "Pagamento confirmado",
        cartCleared: true
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Pagamento falhou" });
    }
  } catch (error) {
    console.error("Erro na verificação:", error);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    // Verificação adicional do token
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: "Token não fornecido" });
    }

    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    // Verificação robusta de admin
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }

    if (!mongoose.modelNames().includes("User")) {
      throw new Error("Modelo User não registrado");
    }

    const user = await userModel.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Acesso restrito a administradores" 
      });
    }

    // Busca todos os pedidos com populate
    const orders = await orderModel.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: orders 
    });

  } catch (error) {
    console.error("Erro no listOrders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar pedidos",
      error: error.message 
    });
  }
};

// api for updating status
const statusOptions = {
  'delivery': ["Food Processing", "Out for delivery", "Delivered"],
  'dine-in': ["Food Processing", "Ready to Serve", "Served", "Completed"]
};

const updateStatus = async (req, res) => {
  try {
    // Verificação mais robusta
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Acesso restrito a administradores" 
      });
    }

    const order = await orderModel.findById(req.body.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    const validStatuses = statusOptions[order.diningOption];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Status inválido para este tipo de pedido" 
      });
    }

    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });

    res.json({ success: true, message: "Status atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno no servidor",
      error: error.message 
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
