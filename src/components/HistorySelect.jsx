function HistorySelect({ history, onSelect }) {
  // Получаем уникальные задачи, сохраняя последнюю длительность для каждой
  const uniqueTasks = history.reduce((acc, session) => {
    if (!acc[session.tag]) {
      acc[session.tag] = {
        tag: session.tag,
        duration: session.duration || Math.floor(session.elapsed / 60)
      };
    }
    return acc;
  }, {});

  const tasks = Object.values(uniqueTasks);

  const handleSelect = (e) => {
    const selectedTag = e.target.value;
    if (selectedTag) {
      const task = uniqueTasks[selectedTag];
      onSelect(task.tag, task.duration ? task.duration.toString() : '');
    } else {
      onSelect('', ''); // Сброс, если выбрана "Новая задача"
    }
  };

  if (tasks.length === 0) {
    return null; // Не рендерим компонент, если история пуста
  }

  return (
    <div>
      <label htmlFor="history-select" className="input-label">Прошлые задачи</label>
      <select
        id="history-select"
        onChange={handleSelect}
        className="select-field"
      >
        <option value="">— Новая задача —</option>
        {tasks.map(({ tag }) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
}

export default HistorySelect;