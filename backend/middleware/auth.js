import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Verificar se o header Authorization existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: "Token de autorização não fornecido" 
      });
    }

    // 2. Verificar formato do token (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false,
        message: "Formato de token inválido" 
      });
    }

    // 3. Verificar token JWT
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Verificar se usuário existe
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Usuário não encontrado" 
      });
    }

    // 5. Adicionar usuário à requisição
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expirado" 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Token inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Erro interno no servidor" 
    });
  }
};

export default authMiddleware;