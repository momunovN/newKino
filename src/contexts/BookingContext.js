import React, { createContext, useState, useEffect } from 'react';
import { getBookings, addBooking as apiAddBooking } from '../api';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const data = await getBookings(token);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const addBooking = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const newBooking = await apiAddBooking(bookingData, token);
      setBookings(prev => [...prev, newBooking]);
      return true;
    } catch (error) {
      console.error('Error adding booking:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <BookingContext.Provider value={{ bookings, addBooking, fetchBookings }}>
      {children}
    </BookingContext.Provider>
  );
};