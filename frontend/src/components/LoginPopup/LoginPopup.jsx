import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import * as jwtDecode from 'jwt-decode';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    // Normaliza o email para minúsculas antes de enviar
    const userData = currentState === "Sign Up" 
      ? { ...data, email: data.email.toLowerCase() } 
      : data;
  
    try {
      const endpoint = currentState === "Login" ? "/login" : "/register";
      const response = await axios.post(`${url}/api/user${endpoint}`, userData, {
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
  
      if (!response.data) {
        throw new Error("Resposta vazia do servidor");
      }
  
      if (response.data.success) {
        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        
        const profileResponse = await axios.get(`${url}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (profileResponse.data.success) {
          setUser(profileResponse.data.user);
          toast.success(
            currentState === "Login" 
              ? "Login realizado com sucesso!" 
              : "Cadastro realizado com sucesso!"
          );
          setShowLogin(false);
        } else {
          throw new Error("Falha ao obter perfil do usuário");
        }
      } else {
        const errorMessage = response.data.message || "Operação falhou";
        
        // Tratamento especial para mensagem de usuário não existe
        if (errorMessage.toLowerCase().includes("usuário") || 
            errorMessage.toLowerCase().includes("user") || 
            errorMessage.toLowerCase().includes("não existe") ||
            errorMessage.toLowerCase().includes("not found")) {
          toast.error("Usuário não existe", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);
      
      let errorMessage = "Erro ao processar login";
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                     error.response.statusText || 
                     `Erro ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor - verifique sua conexão";
      } else {
        errorMessage = error.message || "Erro ao processar requisição";
      }
  
      if (errorMessage.toLowerCase().includes("usuário") || 
          errorMessage.toLowerCase().includes("user") || 
          errorMessage.toLowerCase().includes("não existe") ||
          errorMessage.toLowerCase().includes("not found")) {
        errorMessage = "Usuário não existe";
      }
  
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicione esta função para normalizar o email durante a digitação
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ 
      ...prev, 
      [name]: name === "email" ? value.toLowerCase() : value 
    }));
  };
  return (
    <div className="login-popup-overlay">
      <div className="login-popup">
        <form onSubmit={onLogin} className="login-popup-container">
          <div className="login-popup-header">
            <h2>{currentState}</h2>
            <button 
              type="button"
              className="login-popup-close-btn"
              onClick={() => setShowLogin(false)}
              aria-label="Fechar janela de login"
            >
              <img src={assets.cross_icon} alt="Fechar" />
            </button>
          </div>
          
          <div className="login-popup-inputs">
            {currentState === "Sign Up" && (
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Seu nome"
                required
                disabled={isLoading}
              />
            )}
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Seu email"
              required
              disabled={isLoading}
            />
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder="Sua senha"
              required
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Carregando..." : currentState === "Sign Up" ? "Criar Conta" : "Login"}
          </button>
          
          {currentState === "Sign Up" && (
            <div className="login-popup-condition">
              <input type="checkbox" required id="terms-checkbox" />
              <label htmlFor="terms-checkbox">
                Ao continuar, eu concordo com os termos de uso e política de privacidade.
              </label>
            </div>
          )}
          
          <div className="login-popup-toggle">
            {currentState === "Login" ? (
              <p>
                Não tem uma conta?{" "}
                <span onClick={() => setCurrentState("Sign Up")}>Cadastre-se aqui</span>
              </p>
            ) : (
              <p>
                Já tem uma conta?{" "}
                <span onClick={() => setCurrentState("Login")}>Faça login aqui</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;