import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://tgii-food.onrender.com";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [user, setUser] = useState(null);

  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(url + "/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          console.error("Erro na resposta:", response.data.message);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem('token');
        setToken("");
      }
    }
  };


  // Carrega o usuário quando o token muda
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken); // Isso aciona o useEffect abaixo para carregar o usuário
    }
  }, []);


  const addToCart = async (itemId) => {
    try {
      if (!token) {
        toast.error("Por favor, faça login para adicionar itens ao carrinho");
        return;
      }
  
      const response = await axios.post(
        `${url}/api/cart/add`,
        { itemId }, // Envia apenas o itemId
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      if (response.data.success) {
        setCartItems(prev => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1
        }));
        toast.success("Item adicionado ao carrinho!");
      } else {
        toast.error(response.data.message || "Erro ao adicionar item");
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error(error.response?.data?.message || "Erro ao adicionar item");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

      if (token) {
        const response = await axios.post(
          url + "/api/cart/remove",
          { itemId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data.success) {
          toast.success("Item removido do carrinho");
        } else {
          toast.error("Algo deu errado");
        }
      }
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      toast.error("Falha ao remover item");
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  // StoreContext.js
  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {}, // Corpo vazio
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Adicione este log para verificar a resposta
      console.log("Resposta do carrinho:", response.data);
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Erro detalhado ao carregar carrinho:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token inválido - limpe o token local
        localStorage.removeItem("token");
        setToken("");
        // Redirecione para login se necessário
      }
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchFoodList();

        if (token) {
          // Primeiro carrega os dados do usuário
          await loadUserData();
          // Depois carrega o carrinho
          await loadCardData(token);
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
      }
    };

    initializeData();
  }, [token]);

  // Em algum lugar temporário no seu frontend
  console.log("Token length:", token?.length);
  console.log("Token sample:", token?.slice(0, 10) + "...");

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    user,
    setUser,
    loadUserData
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
