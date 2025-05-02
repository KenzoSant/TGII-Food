import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './AdminReservations.css';

const AdminReservations = () => {
  const navigate = useNavigate();
  const { url, token, admin } = useContext(StoreContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${url}/api/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(response.data);
      
      if (response.data.success) {
        setReservations(response.data.data);
      } else {
        throw new Error(response.data.message || 'Erro ao carregar reservas');
      }
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      setError(error);
      
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Acesso restrito a administradores');
        navigate('/');
      } else {
        toast.error(error.response?.data?.message || 'Erro ao carregar reservas');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(
        `${url}/api/reservations/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Status atualizado com sucesso!');
        fetchReservations();
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  useEffect(() => {
    if (!admin) {
      toast.error('Acesso restrito a administradores');
      navigate('/');
      return;
    }
    fetchReservations();
  }, [admin, navigate, token, url]);

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Gerenciamento de Reservas</h2>
        <div className="loading-spinner"></div>
        <p>Carregando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h2>Gerenciamento de Reservas</h2>
        <div className="error-message">
          <p>Erro ao carregar reservas: {error.message}</p>
          <button onClick={fetchReservations} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container reservations">
      <h2>Gerenciamento de Reservas</h2>
      
      <div className="reservations-header">
        <p>Total de reservas: {reservations.length}</p>
        <button onClick={fetchReservations} className="refresh-btn">
          Atualizar lista
        </button>
      </div>
      
      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <div className="reservations-table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Pessoas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation._id}>
                  <td>{reservation.userId?.name || reservation.customerName}</td>
                  <td>{reservation.userId?.email || reservation.email}</td>
                  <td>{new Date(reservation.date).toLocaleDateString('pt-BR')}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.people}</td>
                  <td>
                    <span className={`status-badge ${reservation.status}`}>
                      {reservation.status === 'pending' && 'Pendente'}
                      {reservation.status === 'confirmed' && 'Confirmado'}
                      {reservation.status === 'rejected' && 'Rejeitado'}
                      {reservation.status === 'canceled' && 'Cancelado'}
                    </span>
                  </td>
                  <td className="actions">
                    <select
                      value={reservation.status}
                      onChange={(e) => updateStatus(reservation._id, e.target.value)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="rejected">Rejeitado</option>
                      <option value="canceled">Cancelado</option>
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

export default AdminReservations;