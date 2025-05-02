import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminReservations.css';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservations');
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao carregar reservas');
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reservations/${id}`, { status });
      toast.success('Status atualizado!');
      fetchReservations();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="admin-container">
      <h2>Gerenciamento de Reservas</h2>
      <table className="reservations-table">
        <thead>
          <tr>
            <th>Nome</th>
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
              <td>{reservation.customerName}</td>
              <td>{new Date(reservation.date).toLocaleDateString()}</td>
              <td>{reservation.time}</td>
              <td>{reservation.people}</td>
              <td>
                <span className={`status-badge ${reservation.status}`}>
                  {reservation.status === 'pending' && 'Pendente'}
                  {reservation.status === 'confirmed' && 'Confirmado'}
                  {reservation.status === 'rejected' && 'Rejeitado'}
                </span>
              </td>
              <td className="actions">
                <button
                  onClick={() => updateStatus(reservation._id, 'confirmed')}
                  className="confirm-btn"
                  disabled={reservation.status === 'confirmed'}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => updateStatus(reservation._id, 'rejected')}
                  className="reject-btn"
                  disabled={reservation.status === 'rejected'}
                >
                  Rejeitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservations;