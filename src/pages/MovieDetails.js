"use client";

import React, { useState, useEffect, useContext } from "react";
import Header from '../components/header'
import { useParams, useNavigate } from "react-router-dom";
import { BookingContext } from "../contexts/BookingContext";
import "../components/header.scss"
import "../App.css";
import "../all.scss";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [movie, setMovie] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", seats: 1 });
  const { addBooking } = useContext(BookingContext);

  useEffect(() => {
    const fetchVideo = async () => {
      const response = await fetch(
        `https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}/videos`,
        {
          headers: {
            "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setVideo(data);
    };

    fetchVideo();
  }, [id]);

  useEffect(() => {
    const fetchMovie = async () => {
      const response = await fetch(
        `https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`,
        {
          headers: {
            "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setMovie(data);
    };

    fetchMovie();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      movieId: movie.kinopoiskId,
      title: movie.nameRu,
      seats: formData.seats,
    };

    const success = await addBooking(bookingData);
    if (success) {
      navigate("/history");
    } else {
      alert("Ошибка при бронировании. Пожалуйста, войдите в систему.");
    }
  };

  if (!movie) return <div>Загрузка...</div>;

  return (
    <main>
      <Header/>

    <div className="movie-details">
      <div className="detailes-item">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Назад
          </button>
        <div className="back-image">
          <img
            src={movie.posterUrl}
            alt={movie.nameRu}
            className="detail-poster"
          />
        </div>
        <div className="detail-info">
          <h1>{movie.nameRu}</h1>
          <p>Год: {movie.year}</p>
          <p>Страна: {movie.countries.map((c) => c.country).join(", ")}</p>
          <p>Жанр: {movie.genres.map((g) => g.genre).join(", ")}</p>
          <p>Рейтинг: {movie.ratingKinopoisk}</p>
          <p>Время: {movie.filmLength} минут</p>
          <p>Возраст: {movie.ratingAgeLimits || "Нет информации"}</p>


          {/* Отображение видео */}
          <div className="video-section">
            <h2>Трейлеры и видео</h2>
            {video && video.items && video.items.length > 0 ? (
              video.items.map((item, index) => (
                <div key={index} className="video-item">
                  <h3>{item.name}</h3>
                  {item.site === "YOUTUBE" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Смотреть на YouTube
                    </a>
                  )}
                  {item.site === "YANDEX_DISK" && (
                    <a
                      href={item.url}
                      target="_blank "
                      rel="noopener noreferrer"
                    >
                      Смотреть на Yandex Disk
                    </a>
                  )}
                  {item.site === "KINOPOISK_WIDGET" && (
                    <iframe
                      is="x-frame-bypass"
                      src={item.url}
                      width="500"
                      height="500"
                      title={item.name}
                    ></iframe>
                  )}
                </div>
              ))
            ) : (
              <p>Нет доступных видео для этого фильма.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Бронирование билетов</h2>
            <input
              type="text"
              placeholder="Ваше имя"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
           {/* { <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />} */}
            <input
              type="number"
              min="1"
              max="10"
              value={formData.seats}
              onChange={(e) =>
                setFormData({ ...formData, seats: e.target.value })
              }
            />
            <button type="submit">Подтвердить бронь</button>
          </form>
        </div>
      </div>
    </div>
    </main>
  );
}
