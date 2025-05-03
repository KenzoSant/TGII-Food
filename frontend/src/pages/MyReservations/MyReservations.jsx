import React, { useContext, useEffect, useState } from "react";
import "./MyReservations.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { useNavigate } from "react-router-dom";

const Reservations = () => {
  const { url, token, user } = useContext(StoreContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${url}/api/reservations/myreservations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Dados das reservas:", response.data);
      setReservations(response.data.data || []);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      setError(error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
      
      const response = await axios.put(
        `${url}/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        toast.success("Reserva cancelada com sucesso!");
        fetchReservations();
      }
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast.error(error.response?.data?.message || "Erro ao cancelar reserva");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    if (user) {
      fetchReservations();
    }
  }, [token, user]);

  if (!user) return <div>Carregando informações do usuário...</div>;
  if (loading) return <div className="loading">Carregando reservas...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'canceled': return 'red';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="myreservations container">
      <h2>Minhas Reservas</h2>
      <div className="container">
        {reservations.length === 0 ? (
          <p>Nenhuma reserva encontrada.</p>
        ) : (
          reservations.map((reservation) => (
            <div key={reservation._id} className="my-reservations-reservation">
              <img src={assets.calendar_icon} alt="Ícone de reserva" />
              <div className="reservation-details">
                <p><strong>Data:</strong> {formatDate(reservation.date)}</p>
                <p><strong>Horário:</strong> {reservation.time}</p>
                <p><strong>Pessoas:</strong> {reservation.people}</p>
                {reservation.notes && <p><strong>Observações:</strong> {reservation.notes}</p>}
              </div>
              <div className="reservation-status">
                <p>
                  <span style={{color: getStatusColor(reservation.status)}}>&#x25cf;</span>
                  <b> 
                    {reservation.status === 'pending' && 'Pendente'}
                    {reservation.status === 'confirmed' && 'Confirmada'}
                    {reservation.status === 'canceled' && 'Cancelada'}
                    {reservation.status === 'rejected' && 'Rejeitada'}
                  </b>
                </p>
              </div>
              <div className="reservation-actions">
                {reservation.status === 'pending' && (
                  <button 
                    onClick={() => cancelReservation(reservation._id)}
                    className="cancel-btn"
                  >
                    Cancelar
                  </button>
                )}
                <button onClick={fetchReservations}>Atualizar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reservations;