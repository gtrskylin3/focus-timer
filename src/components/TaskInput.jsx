function TaskInput({ tag, hours, minutes, onTagChange, onDurationChange }) {
  const handleHoursChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 16)) {
      onDurationChange({ hours: value });
    }
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      onDurationChange({ minutes: value });
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
            onChange={handleHoursChange}
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
            onChange={handleMinutesChange}
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