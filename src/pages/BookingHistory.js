import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../contexts/BookingContext';
import '../App.css';

export default function BookingHistory() {
  const { bookings, fetchBookings } = useContext(BookingContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="history-page">
      <button onClick={() => navigate(-1)} className="back-button">← Назад</button>
      <h1>История бронирований</h1>
      {bookings.length === 0 ? (
        <p>Нет бронирований</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => (
            <div key={index} className="booking-card">
              <h3>{booking.title}</h3>
              <p>Дата: {new Date(booking.date).toLocaleString()}</p>
              <p>Места: {booking.seats}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}