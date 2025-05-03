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
  const [error, setError] = useState(null);

  const fetchAllOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url + "/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setError(error);

      if (error.response?.status === 401) {
        toast.error("Faça login novamente");
        navigate("/");
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

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Painel de Pedidos</h2>
        <div className="loading-spinner"></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h2>Painel de Pedidos</h2>
        <div className="error-message">
          <p>Erro ao carregar pedidos: {error.message}</p>
          <button onClick={fetchAllOrder} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Painel de Pedidos</h2>

      <div className="orders-header">
        <p>Total de pedidos: {orders.length}</p>
        <button onClick={fetchAllOrder} className="refresh-btn">
          Atualizar lista
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Endereço/Mesa</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.userId?.name || "Nome não disponível"}</td>
                  <td>
                    {order.items.map((item, index) => (
                      <span key={item._id || index}>
                        {item.name} x {item.quantity}
                        {index < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </td>
                  <td>
                    {order.diningOption === 'dine-in' ? (
                      `Mesa: ${order.tableNumber}`
                    ) : (
                      <>
                        {order.address?.street}, {order.address?.city}, {order.address?.number}
                      </>
                    )}
                  </td>
                  <td>R$ {order.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions">
                    <select
                      onChange={(event) => statusHandler(event, order._id)}
                      value={order.status}
                    >
                      {order.diningOption === 'dine-in' ? (
                        <>
                          <option value="Preparando">Preparando</option>
                          <option value="Pronto para servir">Pronto para servir</option>
                          <option value="Finalizado">Finalizado</option>
                        </>
                      ) : (
                        <>
                          <option value="Preparando">Preparando</option>
                          <option value="Saiu para entrega">Saiu para entrega</option>
                          <option value="Entregue">Entregue</option>
                        </>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;