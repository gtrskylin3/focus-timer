// src/components/HistorySelect.jsx
import React from 'react';

function HistorySelect({ history, onSelect }) {
  // JS: Получаем уникальные теги из истории (Set для уникальности)
  const uniqueTags = [...new Set(history.map(session => session.tag))];

  // JS: Функция для получения данных по тегу (последняя сессия для примера)
  const getSessionData = (tag) => {
    const sessionsForTag = history.filter(s => s.tag === tag);
    if (sessionsForTag.length === 0) return { duration: null };
    const lastSession = sessionsForTag[sessionsForTag.length - 1];  // Последняя
    return {
      tag,
      duration: lastSession.duration || Math.floor(lastSession.elapsed / 60)  // Если null, elapsed в мин
    };
  };

  const handleSelect = (e) => {
    const selectedTag = e.target.value;
    if (selectedTag) {
      const data = getSessionData(selectedTag);
      onSelect(data.tag, data.duration ? data.duration.toString() : '');  // Callback: тег + duration как строка
    }
  };

  if (uniqueTags.length === 0) {
    return <p className="text-sm text-gray-500">Нет истории сессий</p>;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Выберите прошлую задачу:</label>
      <select
        onChange={handleSelect}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— Новая задача —</option>
        {uniqueTags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
}

export default HistorySelect;