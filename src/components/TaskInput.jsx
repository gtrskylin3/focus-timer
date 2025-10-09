import React from 'react';  // Базовый импорт React (для JSX, хотя в новых версиях optional, но оставим для ясности)

function TaskInput({ tag, durationInMinutes, onTagChange, onDurationChange }) {
  // JS: Нет state — всё из props. onTagChange — это функция setTag из App.

  return (
    <div className="space-y-3 mb-6">  {/* Tailwind: Вертикальный отступ между input'ами */}
      <input
        type="text"
        placeholder="Тег задачи (напр. 'Кодинг')"
        value={tag}  // React: value из props (контролируемый input)
        onChange={(e) => onTagChange(e.target.value)}  // onChange: Вызываем prop-функцию, передавая значение
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Длительность (мин, опционально)"
        value={durationInMinutes}
        onChange={(e) => onDurationChange(e.target.value)}  // Аналогично: e.target.value — текст из input
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default TaskInput;