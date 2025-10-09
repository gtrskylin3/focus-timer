function TaskInput({ tag, durationInMinutes, onTagChange, onDurationChange }) {
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
      <div>
        <label htmlFor="task-duration" className="input-label">Длительность (минуты)</label>
        <input
          id="task-duration"
          type="number"
          placeholder="(Опционально)"
          value={durationInMinutes}
          onChange={(e) => onDurationChange(e.target.value)}
          className="input-field"
          min="1"
        />
      </div>
    </>
  );
}

export default TaskInput;
