function TaskInput({ tag, hours, minutes, onTagChange, onDurationChange }) {
  const handleTimeChange = (e, type) => {
    const value = e.target.value;
    // Разрешаем только цифры и пустое значение
    if (!/^\d*$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    if (type === 'hours') {
      if (value === '' || (numValue >= 0 && numValue <= 16)) {
        onDurationChange({ hours: value });
      }
    } else if (type === 'minutes') {
      if (value === '' || (numValue >= 0 && numValue <= 59)) {
        onDurationChange({ minutes: value });
      }
    }
  };

  return (
    <>
      <div>
        <label htmlFor="task-tag" className="input-label">Задача</label>
        <input
          id="task-tag"
          type="text"
          placeholder="На чем вы фокусируетесь?"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="input-field"
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="task-hours" className="input-label">Часы</label>
          <input
            id="task-hours"
            type="number"
            placeholder="Ч"
            value={hours}
            onChange={(e) => handleTimeChange(e, 'hours')}
            className="input-field"
            min="0"
            max="16"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="task-minutes" className="input-label">Минуты</label>
          <input
            id="task-minutes"
            type="number"
            placeholder="М"
            value={minutes}
            onChange={(e) => handleTimeChange(e, 'minutes')}
            className="input-field"
            min="0"
            max="59"
          />
        </div>
      </div>
    </>
  );
}

export default TaskInput;