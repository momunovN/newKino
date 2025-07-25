// src/api.js
const API_URL = 'https://apinew-d6qv.onrender.com/api';

export const register = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
};

export const getBookings = async (token) => {
  const response = await fetch(`${API_URL}/bookings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

export const addBooking = async (bookingData, token) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  return await response.json();
};