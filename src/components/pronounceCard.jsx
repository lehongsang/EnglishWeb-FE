import React from "react";
import "./pronounceCard.css";

const PronounceCard = ({ symbol, exampleWord, onClick }) => {
  return (
    <button onClick={onClick} className="pronounce-card">
      <div className="pronounce-card-symbol">{symbol}</div>
      <div className="pronounce-card-word">{exampleWord}</div>
    </button>
  );
};

export default PronounceCard;