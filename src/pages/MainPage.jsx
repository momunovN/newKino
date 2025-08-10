import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../components/header.css";
import "../App.css";
import "../Styles/MainPage.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Ключи для localStorage
const CACHE_KEYS = {
  GENRES: 'movieGenres',
  POPULAR: 'popularMovies',
  NEW: 'newMovies',
  TIMESTAMP: 'moviesDataTimestamp'
};

// Время жизни кэша (1 час)
const CACHE_EXPIRATION = 60 * 60 * 1000;

const MainPage = () => {
  const [genres, setGenres] = useState([]);
  const [popularMovies, setPopularMovies] = useState({});
  const [newMovies, setNewMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "31b8142c-7c84-42d7-ba58-c5866aa1bc7b";
  const BASE_URL = "https://kinopoiskapiunofficial.tech/api/v2.2";
  const MOVIES_PER_GENRE = 7;

  // Загрузка данных из кэша
  const loadFromCache = useCallback(() => {
    const cachedGenres = localStorage.getItem(CACHE_KEYS.GENRES);
    const cachedPopular = localStorage.getItem(CACHE_KEYS.POPULAR);
    const cachedNew = localStorage.getItem(CACHE_KEYS.NEW);
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);

    if (cachedGenres && cachedPopular && cachedNew && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_EXPIRATION) {
        setGenres(JSON.parse(cachedGenres));
        setPopularMovies(JSON.parse(cachedPopular));
        setNewMovies(JSON.parse(cachedNew));
        return true;
      }
    }
    return false;
  }, []);

  // Сохранение данных в кэш
  const saveToCache = useCallback((genresData, popularData, newData) => {
    localStorage.setItem(CACHE_KEYS.GENRES, JSON.stringify(genresData));
    localStorage.setItem(CACHE_KEYS.POPULAR, JSON.stringify(popularData));
    localStorage.setItem(CACHE_KEYS.NEW, JSON.stringify(newData));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Пытаемся загрузить из кэша
        const hasCache = loadFromCache();
        if (hasCache) {
          setLoading(false);
          return;
        }

        // Получаем список жанров
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
        const movieGenres = genresData.genres
          .filter((genre) => genre.genre !== "")
          .slice(0, 5);

        // Получаем фильмы по жанрам
        const [popularResults, newResults] = await Promise.all([
          Promise.all(
            movieGenres.map(async (genre) => {
              const response = await fetch(
                `${BASE_URL}/films?genres=${genre.id}&order=RATING&type=ALL&ratingFrom=7&ratingTo=10&page=1`,
                {
                  headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (!response.ok) return { genreId: genre.id, items: [] };
              const data = await response.json();
              return {
                genreId: genre.id,
                items: data.items.slice(0, MOVIES_PER_GENRE),
              };
            })
          ),
          Promise.all(
            movieGenres.map(async (genre) => {
              const response = await fetch(
                `${BASE_URL}/films?genres=${genre.id}&order=NUM_VOTE&type=ALL&yearFrom=2023&page=1`,
                {
                  headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (!response.ok) return { genreId: genre.id, items: [] };
              const data = await response.json();
              return {
                genreId: genre.id,
                items: data.items.slice(0, MOVIES_PER_GENRE),
              };
            })
          ),
        ]);

        // Обрабатываем результаты
        const popularByGenre = {};
        const newByGenre = {};

        movieGenres.forEach((genre, index) => {
          popularByGenre[genre.id] = {
            genre: genre.genre,
            films: popularResults[index].items || [],
          };
          newByGenre[genre.id] = {
            genre: genre.genre,
            films: newResults[index].items || [],
          };
        });

        setGenres(movieGenres);
        setPopularMovies(popularByGenre);
        setNewMovies(newByGenre);
        saveToCache(movieGenres, popularByGenre, newByGenre);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [loadFromCache, saveToCache]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: Math.min(5, MOVIES_PER_GENRE),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    arrows: true,
    centerMode: true,
    centerPadding: "60px",
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    waitForAnimate: false,
    edgeFriction: 0.15,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          centerPadding: "40px",
          slidesToShow: Math.min(4, MOVIES_PER_GENRE),
        },
      },
      {
        breakpoint: 992,
        settings: {
          centerPadding: "30px",
          slidesToShow: Math.min(3, MOVIES_PER_GENRE),
          centerMode: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          centerPadding: "20px",
          slidesToShow: Math.min(2, MOVIES_PER_GENRE),
        },
      },
      {
        breakpoint: 576,
        settings: {
          centerPadding: "10px",
          slidesToShow: 1,
        },
      },
    ],
  };

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
          <section className="movies-section">
            <h2 className="section-title">Популярные фильмы по жанрам</h2>
            {genres.map((genre) => (
              <div key={`popular-${genre.id}`} className="genre-block">
                <h3 className="genre-title">{genre.genre}</h3>
                {popularMovies[genre.id]?.films?.length > 0 ? (
                  <div className="slider-container">
                    <Slider {...sliderSettings}>
                      {popularMovies[genre.id].films.map((film) => (
                        <MovieCard key={film.kinopoiskId || film.filmId} film={film} />
                      ))}
                    </Slider>
                  </div>
                ) : (
                  <p className="no-movies">Нет фильмов в этом жанре</p>
                )}
              </div>
            ))}
          </section>

          <section className="movies-section">
            <h2 className="section-title">Новые фильмы по жанрам</h2>
            {genres.map((genre) => (
              <div key={`new-${genre.id}`} className="genre-block">
                <h3 className="genre-title">{genre.genre}</h3>
                {newMovies[genre.id]?.films?.length > 0 ? (
                  <div className="slider-container">
                    <Slider {...sliderSettings}>
                      {newMovies[genre.id].films.map((film) => (
                        <MovieCard key={film.kinopoiskId || film.filmId} film={film} isNew />
                      ))}
                    </Slider>
                  </div>
                ) : (
                  <p className="no-movies">Нет новых фильмов в этом жанре</p>
                )}
              </div>
            ))}
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
          {!isNew && <p className="movie-year">{film.year || "—"}</p>}
        </div>
      </Link>
    </div>
  );
};

export default MainPage;