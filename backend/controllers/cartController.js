import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.user.id); // Usar req.user.id do middleware
    let cartData = userData.cartData || {};
    
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    
    await userModel.findByIdAndUpdate(req.user.id, { cartData });
    res.json({ success: true, message: "Added to Cart" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};


const removeFromCart = async (req, res) => {
  try {
    // Usar req.user.id em vez de req.body.userId para segurança
    let userData = await userModel.findById(req.user.id);
    let cartData = userData.cartData || {};
    
    if (cartData[req.body.itemId] > 1) {
      cartData[req.body.itemId] -= 1;
    } else {
      delete cartData[req.body.itemId];
    }
    
    await userModel.findByIdAndUpdate(req.user.id, { cartData });
    res.json({ success: true, message: "Removido do Carrinho" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};

const getCart = async (req, res) => {
  try {
    // Verificação mais robusta
    if (!req.user || !req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Usuário não autenticado" 
      });
    }

    const userData = await userModel.findById(req.user.id).select("cartData");
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    res.json({ 
      success: true, 
      cartData: userData.cartData || {} 
    });
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro no servidor" 
    });
  }
};

export { addToCart, removeFromCart, getCart,  };
