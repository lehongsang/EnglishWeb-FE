import React from 'react';
import './roadmap.css';
import { useNavigate } from 'react-router-dom';

const Roadmap = () => {
  const navigate = useNavigate();

  const levels = [
    { id: 1, name: 'Lộ trình 350-500', path: '/detail/350-500' },
    { id: 2, name: 'Lộ trình 500-650', path: '/detail/500-650' },
    { id: 3, name: 'Lộ trình 650-750', path: '/detail/650-750' },
    { id: 4, name: 'Lộ trình 750+', path: '/detail/750+' }
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="roadmap-container">
      {levels.map(level => (
        <div key={level.id} className="roadmap-square" onClick={() => handleClick(level.path)}>
          {level.name}
        </div>
      ))}
    </div>
  );
};

export default Roadmap;
