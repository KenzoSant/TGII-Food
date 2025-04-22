import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    const userData = {
      ...data,
      email: data.email.toLowerCase().trim()
    };
  
    try {
      if (currentState === "Sign Up") {
        // Requisição de cadastro
        const registerResponse = await axios.post(`${url}/api/user/register`, userData);
        
        if (registerResponse.data.success) {
          toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
          setCurrentState("Login"); // Muda para tela de login após cadastro
          setData({...data, password: ""}); // Limpa apenas a senha
        } else {
          throw new Error(registerResponse.data.message || "Falha no cadastro");
        }
      } else {
        // Requisição de login
        const loginResponse = await axios.post(`${url}/api/user/login`, {
          email: userData.email,
          password: userData.password
        });
  
        if (loginResponse.data.success) {
          const token = loginResponse.data.token;
          setToken(token);
          localStorage.setItem("token", token);
          
          const profileResponse = await axios.get(`${url}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          if (profileResponse.data.success) {
            setUser(profileResponse.data.user);
            toast.success("Login realizado com sucesso!");
            setShowLogin(false);
          } else {
            throw new Error("Falha ao obter perfil do usuário");
          }
        } else {
          throw new Error(loginResponse.data.message || "Credenciais inválidas");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      
      let errorMessage = "Erro ao processar a requisição";
      
      if (error.response) {
        // Tratamento específico para erros de resposta
        if (error.response.status === 400) {
          errorMessage = "Dados inválidos enviados";
        } else if (error.response.status === 409) {
          errorMessage = "Este e-mail já está cadastrado";
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      } else {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ 
      ...prev, 
      [name]: name === "email" ? value.toLowerCase().trim() : value 
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <div className="password-input-container">
              <input
                name="password"
                onChange={onChangeHandler}
                value={data.password}
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                required
                disabled={isLoading}
              />
              <span 
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <img 
                  src={showPassword ? assets.eye_icon : assets.eye_slash_icon} 
                  alt={showPassword ? "Ocultar senha" : "Mostrar senha"} 
                />
              </span>
            </div>
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