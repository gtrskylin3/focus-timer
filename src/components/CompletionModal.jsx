
import React from 'react';

function CompletionModal({ isOpen, onClose, sessionData }) {
  if (!isOpen || !sessionData) {
    return null;
  }

  const { sessionDuration, totalTagTime, quote, tag } = sessionData;

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds} сек`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (hours > 0) result += `${hours} ч `;
    if (minutes > 0) result += `${minutes} мин`;
    return result.trim();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Сессия завершена!</h2>
        <div className="modal-stats">
          <p><strong>Задача:</strong> {tag}</p>
          <p><strong>Время сессии:</strong> {formatDuration(sessionDuration)}</p>
          <p><strong>Общее время на задачу:</strong> {formatDuration(totalTagTime)}</p>
        </div>
        <blockquote className="modal-quote">
          <p>"{quote.split(' - ')[0]}"</p>
          <footer>- {quote.split(' - ')[1]}</footer>
        </blockquote>
      </div>
    </div>
  );
}

export default CompletionModal;
