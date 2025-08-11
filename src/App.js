import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";

import Main from "./main/main";
import MovieDetails from "./pages/MovieDetails";
import BookingHistory from "./pages/BookingHistory";
import MainPage from "./pages/MainPage";
import { BookingProvider } from "./contexts/BookingContext";

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/Главная" replace />} />
          <Route path="/Фильмы" element={<Main />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/История" element={<BookingHistory />} />
          <Route path="/Главная" element={<MainPage/>} />
        </Routes>
        
      </Router>
    </BookingProvider>
  );
}

export default App;
