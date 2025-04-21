import { createContext, useEffect, useState } from "react";
import axios from "axios"; // Importação adicionada aqui

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar carregamento
  const url = "https://tgii-food.onrender.com";

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedAdmin = localStorage.getItem("admin");
      
      if (storedToken) {
        try {
          await loadUserData(storedToken);
        } catch (error) {
          handleAuthError(error);
        }
      } else {
        setIsLoading(false);
      }
      
      if (storedAdmin) {
        setAdmin(storedAdmin === "true");
      }
    };

    initializeAuth();
  }, []);

  const loadUserData = async (token) => {
    const response = await axios.get(url + "/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setUser(response.data.user);
      setAdmin(response.data.user.role === "admin");
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("admin", response.data.user.role === "admin");
    } else {
      throw new Error("Failed to load user data");
    }
    setIsLoading(false);
  };

  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken("");
    setAdmin(false);
    setUser(null);
    setIsLoading(false);
  };

  const contextValue = {
    token,
    setToken,
    admin,
    setAdmin,
    user,
    setUser,
    url,
    isLoading // Disponibiliza o estado de loading no contexto
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {!isLoading ? props.children : <div>Loading...</div>}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
