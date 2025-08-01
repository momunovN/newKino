import React, { useState, useEffect } from "react";
import "../all.scss";
import { Link } from "react-router-dom";
import "../server-API/movie.scss";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let url = new URL(
          "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections"
        );

        url.searchParams.append("type", "TOP_POPULAR_MOVIES");
        url.searchParams.append("page", currentPage.toString());

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
          if (currentPage === 1) setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]);

  // Update displayed movies
  useEffect(() => {
    const initialCount = Math.min(9, movies.length);
    setDisplayedMovies(movies.slice(0, initialCount));
  }, [movies]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const showMoreFiltered = () => {
    setDisplayedMovies((prev) => {
      const newCount = prev.length + 3;
      return movies.slice(0, newCount);
    });
  };

  const canShowMore = movies.length > displayedMovies.length;

  return (
    <div className="App">
      <div className="title-main">
        <h1>Фильмы</h1>
        
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="movies-container">
        {displayedMovies.length > 0
          ? displayedMovies.map((movie) => (
              <div
                key={movie.kinopoiskId || movie.filmId}
                className="movie-card"
              >
                <Link className="link-btn" to={`/movie/${movie.kinopoiskId || movie.filmId}`}>
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
                </Link>
                <div className="movie-info">
                  <Link className="link-btn" to={`/movie/${movie.kinopoiskId || movie.filmId}`}>
                    <h2>{movie.nameRu || movie.nameEn || movie.nameOriginal}</h2>
                  </Link>
                  <p>Год: {movie.year}</p>
                  {movie.genres && (
                    <p>Жанр: {movie.genres.map((g) => g.genre).join(", ")}</p>
                  )}
                  <button className="ticket-btn">
                    <Link 
                      to={`/movie/${movie.kinopoiskId || movie.filmId}`}
                      className="book-button"
                    >
                      Бронировать
                    </Link>
                  </button>
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
        {hasMore && !isLoading && (
          <button onClick={loadMore} className="load-more-button">
            Загрузить еще
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;