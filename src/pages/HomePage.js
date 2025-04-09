import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieFilter from "../components/Filter/FilterComp";
import "../server-API/movie.scss";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      const response = await fetch(
        "https://kinopoiskapiunofficial.tech/api/v2.2/films/filters",
        {
          headers: {
            "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setGenres(data.genres);
    };

    fetchGenres();
  }, []);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        let url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?genres=1&order=RATING&type=FILM&ratingFrom=8&ratingTo=10&yearFrom=2010&yearTo=3000&page=${currentPage}`;
        
        if (isFilterApplied && keyword) {
          url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url, {
          headers: {
            "X-API-KEY": "31b8142c-7c84-42d7-ba58-c5866aa1bc7b",
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          setMovies(prev => [...prev, ...data.items]);
          setHasMore(data.totalPages > currentPage);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, isFilterApplied, keyword]);

  // Apply filters and set initial displayed movies
  useEffect(() => {
    let result = [...movies];

    // Filter by selected genre
    if (selectedGenre) {
      result = result.filter(movie => 
        movie.genres && movie.genres.some(genre => genre.genre === selectedGenre)
      );
    }

    // Show at least 9 movies initially
    const initialCount = Math.min(9, result.length); // Show 9 movies initially
    setDisplayedMovies(result.slice(0, initialCount));
  }, [selectedGenre, movies]);

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const showMoreFiltered = () => {
    setDisplayedMovies(prev => {
      const newCount = prev.length + 3; // Show 3 more movies
      const filtered = applyFilters();
      return filtered.slice(0, newCount);
    });
  };

  const applyFilters = () => {
    let result = [...movies];

    // Filter by selected genre
    if (selectedGenre) {
      result = result.filter(movie => 
        movie.genres && movie.genres.some(genre => genre.genre === selectedGenre)
      );
    }

    // If keyword is not empty, filter by keyword
    if (keyword) {
      result = result.filter(movie => 
        movie.nameRu.toLowerCase().includes(keyword.toLowerCase()) || 
        movie.nameEn.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return result;
  };

  const handleApplyFilters = () => {
    setIsFilterApplied(true);
    setCurrentPage(1);
    setMovies([]);
  };

  const canShowMore = applyFilters().length > displayedMovies.length;

  return (
    <div className="App">
      <h1>Фильмы</h1>
      <nav>
        <Link to="/history" className="history-link">
          История бронирований
        </Link>
      </nav>
      
      <MovieFilter
        genres={genres}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        keyword={keyword}
        setKeyword={setKeyword}
        onApply={handleApplyFilters}
      />

      <div className="movies-container">
        {displayedMovies.map((movie) => (
          <div key={movie.kinopoiskId || movie.filmId} className="movie-card">
            <img
              src={movie.posterUrl}
              alt={movie.nameRu || movie.nameEn}
              className="movie-poster"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
              }}
            />
            <div className="movie-info">
              <h2>{movie.nameRu || movie.nameEn || movie.nameOriginal}</h2>
              <p>Год: {movie.year}</p>
              {movie.genres && <p>Жанр: {movie.genres.map(g => g.genre).join(", ")}</p>}
              <Link to={`/movie/${movie.kinopoiskId || movie.filmId}`} className="book-button">
                Бронировать
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="load-more-container">
        {isLoading && <div className="loading">Загрузка...</div>}
        {canShowMore && !isLoading && (
          <button onClick={showMoreFiltered} className="load-more-button">
            Показать еще 3 фильма
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;