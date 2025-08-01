"use client";

import React, { useState, useEffect, useContext } from "react";
import Header from "../components/header";
import { useParams, useNavigate } from "react-router-dom";
import { BookingContext } from "../contexts/BookingContext";
import "../components/header.scss";
import "../App.css";
import "../all.scss";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: "", seats: 1 });
  const [activeTab, setActiveTab] = useState("description");
  const { addBooking } = useContext(BookingContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const movieResponse = await fetch(
          `https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`,
          {
            headers: {
              "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
              "Content-Type": "application/json",
            },
          }
        );

        if (!movieResponse.ok) {
          throw new Error("Не удалось загрузить данные о фильме");
        }

        const movieData = await movieResponse.json();
        setMovie(movieData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const bookingData = {
        movieId: movie.kinopoiskId,
        title: movie.nameRu,
        seats: parseInt(formData.seats),
        userName: formData.name,
      };

      const success = await addBooking(bookingData);
      if (success) {
        navigate("/history");
      } else {
        alert("Ошибка при бронировании. Пожалуйста, войдите в систему.");
      }
    } catch (err) {
      alert("Произошла ошибка: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!movie) return <div>Данные о фильме не найдены</div>;

  return (
    <main>
      <div className="mov-det-header">
        <div className="container">
          <Header />
        </div>
      </div>

      <div className="movie-details">
        <div className="detailes-item">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Назад
          </button>
          <div className="back-image">
            <img
              src={movie.posterUrl}
              alt={movie.nameRu || "Постер фильма"}
              className="detail-poster"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x450?text=No+Poster";
              }}
            />
          </div>
          <div className="detail-info">
            <h1>{movie.nameRu || "Название не указано"}</h1>
            
            {/* Табы */}
            <div className="tabs">
              <button
                className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Описание
              </button>
              <button
                className={`tab-button ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
              >
                О фильме
              </button>
              <button
                className={`tab-button ${activeTab === "crew" ? "active" : ""}`}
                onClick={() => setActiveTab("crew")}
              >
                Съёмочная группа
              </button>
            </div>

            {/* Содержимое табов */}
            <div className="tab-content">
              {activeTab === "description" && (
                <div className="description-section">
                  <p>{movie.description || "Описание отсутствует"}</p>
                </div>
              )}

              {activeTab === "about" && (
                <div className="about-section">
                  <p>Год: {movie.year || "Нет данных"}</p>
                  <p>
                    Страна:{" "}
                    {movie.countries?.map((c) => c.country).join(", ") ||
                      "Нет данных"}
                  </p>
                  <p>
                    Жанр:{" "}
                    {movie.genres?.map((g) => g.genre).join(", ") || "Нет данных"}
                  </p>
                  <p>Рейтинг: {movie.ratingKinopoisk || "Нет данных"}</p>
                  <p>
                    Время:{" "}
                    {movie.filmLength ? `${movie.filmLength} минут` : "Нет данных"}
                  </p>
                  <p>
                    Возраст:{" "}
                    {movie.ratingAgeLimits
                      ? `${movie.ratingAgeLimits.replace("age", "")}+`
                      : "Нет информации"}
                  </p>
                </div>
              )}

              {activeTab === "crew" && (
                <div className="crew-section">
                  {movie.staff && movie.staff.length > 0 ? (
                    <ul>
                      {movie.staff.map((person) => (
                        <li key={person.staffId}>
                          <strong>{person.nameRu || person.nameEn}</strong> - {person.professionText || person.professionKey}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Информация о съёмочной группе отсутствует</p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <h2>Бронирование билетов</h2>
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
                value={formData.name}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="seats"
                min="1"
                max="10"
                placeholder="Количество мест"
                required
                value={formData.seats}
                onChange={handleInputChange}
              />
              <button type="submit">Подтвердить бронь</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}