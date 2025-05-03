import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';


const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, url, user, setUser } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    firstName: "",
    email: "",
    street: "",
    city: "",
    number: "",
    zipcode: "",
    phone: "",
  });
  const [diningOption, setDiningOption] = useState("delivery");
  const [showScanner, setShowScanner] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const handleScan = async (result) => {
    if (!result || !result.length) {
      toast.error("QR Code inválido. Tente novamente.");
      return;
    }

    // Extrai o valor do QR Code (assumindo formato: [{ rawValue: '01', ... }])
    const scannedTableNumber = result[0]?.rawValue || result[0]?.text || result[0];
    console.log("Valor escaneado:", scannedTableNumber); // Debug

    if (!scannedTableNumber) {
      toast.error("Número da mesa não encontrado no QR Code.");
      return;
    }

    try {
      if (!user?._id) {
        throw new Error("Dados do usuário não carregados.");
      }

      const orderItems = food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
        }));

      const orderData = {
        userId: user._id,
        items: orderItems,
        amount: getTotalCartAmount(),
        diningOption: "dine-in",
        tableNumber: scannedTableNumber, // Agora garantido que tem o valor do QR
      };

      console.log("Dados enviados:", orderData); // Debug

      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        window.location.href = response.data.session_url;
      }
    } catch (error) {
      console.error("Erro detalhado:", error);
      toast.error(error.response?.data?.message || "Erro ao criar pedido.");

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  console.log("Token atual:", token);
  console.log("Usuário atual:", user);

  const handleError = (err) => {
    console.error(err);
    toast.error("Erro ao escanear QR code");
  };


  const placeDeliveryOrder = async (e) => {
    e.preventDefault();

    const currentToken = localStorage.getItem('token') || token;
    if (!currentToken) {
      toast.error("Por favor, faça login primeiro");
      navigate("/");
      return;
    }

    try {
      if (!token) {
        toast.error("Por favor, faça login primeiro");
        navigate("/");
        return;
      }

      if (!user?._id) {
        toast.error("Dados do usuário não carregados. Por favor, recarregue a página.");
        return;
      }

      const orderItems = food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
        }));

      const orderData = {
        userId: user._id,
        items: orderItems,
        amount: getTotalCartAmount() + 2, // Inclui taxa de entrega
        address: data,
        diningOption: 'delivery'
      };

      const response = await axios.post(
        `${url}/api/order/place`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        window.location.href = response.data.session_url;
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast.error(error.response?.data?.message || "Erro ao criar pedido de delivery");

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        toast.error("Por favor, faça login primeiro");
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(url + "/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setUser(response.data.user); // Agora setUser está definido
        } else {
          toast.error("Sessão expirada");
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        toast.error("Erro ao carregar dados do usuário");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token, navigate]);

  return (
    <form
      className="place-order container"
      onSubmit={diningOption === "delivery" ? placeDeliveryOrder : (e) => e.preventDefault()}
    >
      <div className="place-order-left">
        <p className="title">Opções</p>
        <div className="dining-options">
          <label>
            <input
              type="radio"
              name="diningOption"
              checked={diningOption === "delivery"}
              onChange={() => setDiningOption("delivery")}
            />
            Delivery
          </label>
          <label>
            <input
              type="radio"
              name="diningOption"
              checked={diningOption === "dine-in"}
              onChange={() => setDiningOption("dine-in")}
            />
            Consumo no Local
          </label>
        </div>

        {diningOption === "delivery" ? (
          <>
            <p className="title">Informações de Entrega</p>
            <div className="multi-fields">
              <input
                required
                name="firstName"
                value={data.firstName}
                onChange={onChangeHandler}
                type="text"
                placeholder="Nome"
              />
            </div>
            <input
              required
              name="email"
              value={data.email}
              onChange={onChangeHandler}
              type="email"
              placeholder="Email"
            />
            <input
              required
              name="street"
              value={data.street}
              onChange={onChangeHandler}
              type="text"
              placeholder="Endereço"
            />
            <div className="multi-fields">
              <input
                required
                name="city"
                value={data.city}
                onChange={onChangeHandler}
                type="text"
                placeholder="Cidade"
              />
              <input
                required
                name="number"
                value={data.number}
                onChange={onChangeHandler}
                type="text"
                placeholder="Numero"
              />
            </div>
            <div className="multi-fields">
              <input
                required
                name="zipcode"
                value={data.zipcode}
                onChange={onChangeHandler}
                type="text"
                placeholder="CEP"
              />
            </div>
            <input
              required
              name="phone"
              value={data.phone}
              onChange={onChangeHandler}
              type="tel"
              placeholder="Telefone"
            />
          </>
        ) : (
          <>
            <p className="title">Informações da Mesa</p>
            <div className="qr-scanner-section">
              {tableNumber ? (
                <div className="table-info">
                  <p className="table-number">Mesa: {tableNumber}</p>
                  <p>Aguarde, redirecionando para pagamento...</p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="scan-qr-btn"
                    onClick={() => setShowScanner(true)}
                  >
                    Escanear QR Code da Mesa
                  </button>
                  {showScanner && (
                    <div className="qr-scanner-modal">
                      <div className="qr-scanner-container">
                        <h4>Escanear QR Code da Mesa</h4>
                        <Scanner
                          onScan={handleScan}
                          onError={handleError}
                          constraints={{ facingMode: 'environment' }}
                          onDecode={(result) => {
                            console.log("Resultado do QR:", result); // Verifique o valor aqui
                            handleScan(result);
                          }}
                        />

                        <button
                          type="button"
                          className="qr-scanner-close"
                          onClick={() => setShowScanner(false)}
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Total do Carrinho</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>R${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Taxa de Entrega</p>
              <p>R${diningOption === "delivery" ? 2 : 0}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>R${getTotalCartAmount() + (diningOption === "delivery" ? 2 : 0)}</b>
            </div>
          </div>
          {diningOption === "delivery" && (
            <button type="submit" className="proceed-btn">
              FINALIZAR PEDIDO
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;