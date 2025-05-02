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
  
    useEffect(() => {
      if (!admin) {
        toast.error('Acesso restrito a administradores');
        navigate('/');
        return;
      }
      fetchReservations();
    }, [admin, navigate]);
  
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/reservations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Resposta da API:", response); // Para debug
        
        // Verifica diferentes formatos de resposta
        const data = response.data.data || response.data;
        
        if (!Array.isArray(data)) {
          throw new Error('Formato de dados inválido');
        }
        
        setReservations(data);
      } catch (error) {
        console.error("Erro detalhado:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Erro ao carregar reservas');
        }
      } finally {
        setLoading(false);
      }
    };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${url}/api/reservations/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Status atualizado com sucesso!');
      fetchReservations(); // Recarrega a lista após atualização
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Gerenciamento de Reservas</h2>
        <div className="loading-spinner"></div>
        <p>Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Gerenciamento de Reservas</h2>
      
      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>Nenhuma reserva encontrada.</p>
          <button onClick={fetchReservations} className="refresh-btn">
            Recarregar
          </button>
        </div>
      ) : (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Nome</th>
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
                <td>{reservation.customerName}</td>
                <td>{reservation.email}</td>
                <td>{new Date(reservation.date).toLocaleDateString('pt-BR')}</td>
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
      )}
    </div>
  );
};

export default AdminReservations;