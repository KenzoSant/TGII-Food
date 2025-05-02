import React, { useState, useEffect, useContext } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const { token, admin, url, user } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + "/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Erro completo:", error);

      if (error.response?.status === 401) {
        toast.error("Faça login novamente");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Acesso restrito a administradores");
      } else {
        toast.error("Erro ao carregar pedidos");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: event.target.value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrder();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Falha ao atualizar status");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (admin) {
      fetchAllOrder();
    } else {
      toast.error("Acesso restrito a administradores");
      navigate("/");
    }
  }, [token, admin, navigate]);

  if (loading) return <div className="loading">Carregando pedidos...</div>;

  return (
    <div className="order add">
      <h3>Painel de Pedidos</h3>
      <div className="order-list">
        {orders.length === 0 ? (
          <p className="no-orders">Nenhum pedido encontrado</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-item">
              <img src={assets.parcel_icon} alt="Ícone de pedido" />
              <div>
                <p className="order-item-food">
                  {order.diningOption === 'dine-in' && (
                    <span className="order-item-table">{order.userId?.name || "Nome não disponível"}<br></br>Mesa: {order.tableNumber}<br></br><br></br></span>
                    

                  )}
                  {order.items.map((item, index) => (
                    <span key={item._id || index}> 
                      {item.name} x {item.quantity}
                      {index < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>

                {order.address && (
                  <>
                    <p className="order-item-name">
                      {order.address.firstName}
                    </p>
                    <div className="order-item-address">
                      <p>{order.address.street},</p>
                      <p>
                        {order.address.city}, {order.address.state}, {order.address.zipcode}
                      </p>
                    </div>
                    <p className="order-item-phone">{order.address.phone}</p>
                  </>
                )}
              </div>
              <p>Itens: {order.items.length}</p>
              <p>R$ {order.amount.toFixed(2)}</p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Preparando">Preparando</option>
                <option value="Saiu para entrega">Saiu para entrega</option>
                <option value="Entregue">Entregue</option>
                {order.diningOption === 'dine-in' && (
                  <>
                    <option value="Pronto para servir">Pronto para servir</option>
                    <option value="Finalizado">Finalizado</option>
                  </>
                )}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;