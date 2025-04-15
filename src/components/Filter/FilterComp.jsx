import React, { useState } from "react";
import '../header.scss'


const MovieFilter = ({ 
  genres, 
  selectedGenre, 
  setSelectedGenre, 
  keyword,
  setKeyword,
  onApply 
}) => {
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localGenre, setLocalGenre] = useState(selectedGenre);

  const handleApply = () => {
    setKeyword(localKeyword);
    setSelectedGenre(localGenre);
    onApply();
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="genre">Жанр:</label>
        <select
          id="genre"
          value={localGenre}
          onChange={(e) => setLocalGenre(e.target.value)}
          className="select-genres"
        >
          <option value="" className="">Все жанры</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.genre} className="option-genres">
              {genre.genre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="keyword">Ключевое слово:</label>
        <input
          id="keyword"
          type="text"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="Введите ключевое слово"
          className="filter-search"
        />
      </div>

      <button onClick={handleApply} className="apply-button">
        Применить
      </button>
    </div>
  );
};

export default MovieFilter; 