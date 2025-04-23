import React, { useState, useEffect } from "react";

import "../all.scss";
import { Link } from "react-router-dom";
import MovieFilter from "../components/Filter/FilterComp";
import "../server-API/movie.scss";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [error, setError] = useState(null);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          "https://kinopoiskapiunofficial.tech/api/v2.2/films/filters",
          {
            headers: {
              "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
        setError("Failed to load genres");
      }
    };

    fetchGenres();
  }, []);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let url = new URL(
          "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections"
        );

        // Базовые параметры
        // url.searchParams.append("order", "RATING");
        // url.searchParams.append("type", "FILM");
        // url.searchParams.append("ratingFrom", "8");
        // url.searchParams.append("ratingTo", "10");
        // url.searchParams.append("yearFrom", "2018");
        url.searchParams.append("type", "TOP_POPULAR_MOVIES");
        url.searchParams.append("page", currentPage.toString());

        // Добавляем жанр, если выбран
        if (selectedGenre) {
          url.searchParams.append("genres", selectedGenre);
        }

        // Добавляем ключевое слово, если есть
        if (isFilterApplied && keyword) {
          url.searchParams.append("keyword", keyword);
        }

        const response = await fetch(url, {
          headers: {
            "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          setMovies((prev) =>
            currentPage === 1 ? data.items : [...prev, ...data.items]
          );
          setHasMore(data.totalPages > currentPage);
        } else {
          setHasMore(false);
          if (currentPage === 1) setMovies([]); // Нет результатов
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, isFilterApplied, keyword, selectedGenre]);

  // Apply filters to displayed movies
  useEffect(() => {
    let result = [...movies];

    // Filter by keyword if applied
    if (keyword && isFilterApplied) {
      result = result.filter(
        (movie) =>
          (movie.nameRu &&
            movie.nameRu.toLowerCase().includes(keyword.toLowerCase())) ||
          (movie.nameEn &&
            movie.nameEn.toLowerCase().includes(keyword.toLowerCase())) ||
          (movie.nameOriginal &&
            movie.nameOriginal.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    // Filter by selected genre if applied
    if (selectedGenre) {
      result = result.filter(
        (movie) =>
          movie.genres &&
          movie.genres.some((genre) => genre.genre === selectedGenre)
      );
    }

    // Show initial set of movies
    const initialCount = Math.min(3, result.length);
    setDisplayedMovies(result.slice(0, initialCount));
  }, [movies, selectedGenre, keyword, isFilterApplied]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const showMoreFiltered = () => {
    setDisplayedMovies((prev) => {
      const newCount = prev.length + 3;
      const filtered = applyFilters();
      return filtered.slice(0, newCount);
    });
  };

  const applyFilters = () => {
    let result = [...movies];

    if (selectedGenre) {
      result = result.filter(
        (movie) =>
          movie.genres &&
          movie.genres.some((genre) => genre.genre === selectedGenre)
      );
    }

    if (keyword) {
      result = result.filter(
        (movie) =>
          (movie.nameRu &&
            movie.nameRu.toLowerCase().includes(keyword.toLowerCase())) ||
          (movie.nameEn &&
            movie.nameEn.toLowerCase().includes(keyword.toLowerCase())) ||
          (movie.nameOriginal &&
            movie.nameOriginal.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    return result;
  };

  const handleApplyFilters = () => {
    setIsFilterApplied(true);
    setCurrentPage(1); // Сбрасываем на первую страницу
    // Не очищаем movies, чтобы сохранить уже загруженные данные
  };

  const canShowMore = applyFilters().length > displayedMovies.length;

  return (
    <div className="App">
      <div className="title-main">
        <h1>Фильмы</h1>
        <nav>
          <button className="btn-history">
            <Link to="/history" className="history-link">
              История бронирований
            </Link>
          </button>
        </nav>
      </div>



      <MovieFilter
        genres={genres}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        keyword={keyword}
        setKeyword={setKeyword}
        onApply={handleApplyFilters}
      />

      {error && <div className="error-message">{error}</div>}

      <div className="movies-container">
        {displayedMovies.length > 0
          ? displayedMovies.map((movie) => (
              <div
                key={movie.kinopoiskId || movie.filmId}
                className="movie-card"
              >
                <img
                  src={movie.posterUrl}
                  alt={
                    movie.nameRu ||
                    movie.nameEn ||
                    movie.nameOriginal ||
                    "Movie poster"
                  }
                  className="movie-poster"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x450?text=No+Poster";
                  }}
                />
                <div className="movie-info">
                  <h2>{movie.nameRu || movie.nameEn || movie.nameOriginal}</h2>
                  <p>Год: {movie.year}</p>
                  {movie.genres && (
                    <p>Жанр: {movie.genres.map((g) => g.genre).join(", ")}</p>
                  )}
                  <Link
                    to={`/movie/${movie.kinopoiskId || movie.filmId}`}
                    className="book-button"
                  >
                    Бронировать
                  </Link>
                </div>
              </div>
            ))
          : !isLoading && (
              <div className="no-results">
                Нет фильмов, соответствующих критериям поиска
              </div>
            )}
      </div>

      <div className="load-more-container">
        {isLoading && <div className="loading">Загрузка...</div>}
        {canShowMore && !isLoading && (
          <button onClick={showMoreFiltered} className="load-more-button">
            Показать еще 3 фильма
          </button>
        )}
        {!isFilterApplied && hasMore && !isLoading && (
          <button onClick={loadMore} className="load-more-button">
            Загрузить еще
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
