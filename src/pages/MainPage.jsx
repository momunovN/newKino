import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../components/header.css";
import "../App.css";
import "../Styles/MainPage.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MainPage = () => {
  const [genres, setGenres] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("all");

  const API_KEY = "31b8142c-7c84-42d7-ba58-c5866aa1bc7b";
  const BASE_URL = "https://kinopoiskapiunofficial.tech/api/v2.2";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем список популярных жанров
        const genresResponse = await fetch(`${BASE_URL}/films/filters`, {
          headers: {
            "X-API-KEY": API_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!genresResponse.ok) {
          throw new Error(`HTTP error! status: ${genresResponse.status}`);
        }

        const genresData = await genresResponse.json();
        const popularGenres = genresData.genres
          .filter(genre => genre.genre !== "")
          .slice(0, 5); // Берем топ-5 жанров

        setGenres(popularGenres);

        // Получаем популярные и новые фильмы
        const [popularRes, newRes] = await Promise.all([
          fetch(`${BASE_URL}/films?order=RATING&type=ALL&ratingFrom=7&ratingTo=10&yearFrom=2010&yearTo=3000&page=1`, {
            headers: {
              "X-API-KEY": API_KEY,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${BASE_URL}/films?order=NUM_VOTE&type=ALL&yearFrom=2023&page=1`, {
            headers: {
              "X-API-KEY": API_KEY,
              "Content-Type": "application/json",
            },
          })
        ]);

        const popularData = await popularRes.json();
        const newData = await newRes.json();

        setPopularMovies(popularData.items || []);
        setNewMovies(newData.items || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const filteredPopularMovies = selectedGenre === "all" 
    ? popularMovies 
    : popularMovies.filter(movie => 
        movie.genres?.some(g => g.genre.toLowerCase() === selectedGenre.toLowerCase())
      );

  const filteredNewMovies = selectedGenre === "all" 
    ? newMovies 
    : newMovies.filter(movie => 
        movie.genres?.some(g => g.genre.toLowerCase() === selectedGenre.toLowerCase())
      );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="Main">
      <header className="header">
        <div className="container">
          <Header />
        </div>
      </header>
      
      <main className="MainPage">
        <div className="container">
          {/* Фильтр по жанрам */}
          <div className="genre-filter">
            <button 
              className={`genre-tag ${selectedGenre === "all" ? "active" : ""}`}
              onClick={() => setSelectedGenre("all")}
            >
              Все жанры
            </button>
            {genres.map(genre => (
              <button
                key={genre.id}
                className={`genre-tag ${selectedGenre === genre.genre.toLowerCase() ? "active" : ""}`}
                onClick={() => setSelectedGenre(genre.genre.toLowerCase())}
              >
                {genre.genre}
              </button>
            ))}
            <Link to="/Фильмы" className="more-films-btn">
              Еще фильмы →
            </Link>
          </div>

          {/* Популярные фильмы */}
          <section className="movies-section">
            <h2 className="section-title">Популярные фильмы</h2>
            {filteredPopularMovies.length > 0 ? (
              <Slider {...sliderSettings}>
                {filteredPopularMovies.map(film => (
                  <MovieCard key={film.kinopoiskId || film.filmId} film={film} />
                ))}
              </Slider>
            ) : (
              <p className="no-movies">Нет фильмов в выбранном жанре</p>
            )}
          </section>

          {/* Новые фильмы */}
          <section className="movies-section">
            <h2 className="section-title">Новые фильмы</h2>
            {filteredNewMovies.length > 0 ? (
              <Slider {...sliderSettings}>
                {filteredNewMovies.map(film => (
                  <MovieCard key={film.kinopoiskId || film.filmId} film={film} isNew />
                ))}
              </Slider>
            ) : (
              <p className="no-movies">Нет новых фильмов в выбранном жанре</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const MovieCard = ({ film, isNew = false }) => {
  const navigate = useNavigate();
  const [clickAllowed, setClickAllowed] = useState(true);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Запоминаем начальные координаты при нажатии мыши
    setStartCoords({ x: e.clientX, y: e.clientY });
    setClickAllowed(true);
  };

  const handleMouseMove = (e) => {
    // Если движение мыши больше 5px, блокируем клик
    const dx = Math.abs(e.clientX - startCoords.x);
    const dy = Math.abs(e.clientY - startCoords.y);
    if (dx > 5 || dy > 5) {
      setClickAllowed(false);
    }
  };

  const handleClick = (e) => {
    if (!clickAllowed) {
      e.preventDefault();
      return;
    }
    navigate(`/movie/${film.kinopoiskId || film.filmId}`);
  };

  return (
    <div 
      className="movie-card"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <Link 
        to={`/movie/${film.kinopoiskId || film.filmId}`} 
        onClick={handleClick}
        className="movie-link"
      >
        <div className="poster-container">
          <img
            src={film.posterUrlPreview || "https://via.placeholder.com/150x225?text=No+poster"}
            alt={film.nameRu || film.nameEn || "Название фильма"}
            className="movie-poster"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150x225?text=No+poster";
            }}
            loading="lazy"
          />
          <div className="movie-overlay">
            {isNew && <span className="new-badge">NEW</span>}
            <span className="rating-badge">
              {film.ratingKinopoisk || film.rating || "—"}
            </span>
          </div>
        </div>
        <div className="movie-info">
          <h4 className="movie-title">{film.nameRu || film.nameEn || "Без названия"}</h4>
          <p className="movie-year">{film.year || "—"}</p>
        </div>
      </Link>
    </div>
  );
};

export default MainPage;