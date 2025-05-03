import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token, user } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      if (!user) return;

      setLoading(true);
      setError(null);

      const response = await axios.post(
        url + "/api/order/userorders",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Dados dos pedidos:", response.data);
      setData(response.data.data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setError(error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'preparando': return 'orange';
      case 'pronto para servir': return 'blue';
      case 'saiu para entrega': return 'blue';
      case 'entregue': return 'green';
      case 'finalizado': return 'green';
      default: return 'gray';
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [token, user]);

  if (!user) return <div>Carregando informações do usuário...</div>;
  if (loading) return <div className="loading">Carregando pedidos...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="my-orders container">
      <h2>Meus Pedidos</h2>
      <div className="container">
        {data.length === 0 ? (
          <p>Nenhum pedido encontrado.</p>
        ) : (
          data.map((order, index) => (
            <div key={order._id || index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="Ícone de pedido" />
              <p>
                {order.items.map(item => `${item.name} X ${item.quantity}`).join(", ")}
              </p>
              <p>R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Itens: {order.items.length}</p>
              <p>
                <span style={{ color: getStatusColor(order.status) }}>&#x25cf;</span>
                <b> {order.status}</b>
              </p>
              <button onClick={fetchOrders}>Atualizar Status</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;