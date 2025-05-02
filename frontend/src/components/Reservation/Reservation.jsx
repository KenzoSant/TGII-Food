import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Reservation.css';

const Reservation = () => {
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        date: new Date(),
        time: '19:00',
        people: 2,
        notes: ''
    });

    const timeSlots = [
        '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const reservationData = {
                customerName: formData.customerName,
                email: formData.email,
                phone: formData.phone,
                date: formData.date.toISOString().split('T')[0],
                time: formData.time,
                people: formData.people,
                notes: formData.notes
            };

            const response = await axios.post(`${url}/api/reservations`, reservationData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate("/");
            }
        } catch (error) {
            console.error("Error details:", error);
            if (error.response?.status === 401) {
                toast.error("Por favor, faça login para reservar uma mesa");
                navigate("/login");
            } else {
                toast.error(error.response?.data?.message || "Erro ao enviar reserva");
            }
        }
    };

    return (
        <div className="reservation-container">
            <h2>Reserva de Mesa</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome Completo:</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Telefone:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Data:</label>
                    <DatePicker
                        selected={formData.date}
                        onChange={(date) => setFormData({ ...formData, date })}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Horário:</label>
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    >
                        {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Quantidade de Pessoas:</label>
                    <input
                        type="number"
                        name="people"
                        min="1"
                        max="12"
                        value={formData.people}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Observações (Opcional):</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Enviar Reserva
                </button>
            </form>
        </div>
    );
};

export default Reservation;