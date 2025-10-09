import CustomSelect from './CustomSelect';

function HistorySelect({ history, onSelect }) {
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

  const handleSelect = (selectedValue) => {
    if (selectedValue) {
      const task = uniqueTasks[selectedValue];
      onSelect(task.tag, task.duration ? task.duration.toString() : '');
    } else {
      onSelect('', '');
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  const options = tasks.map(task => ({ value: task.tag, label: task.tag }));

  return (
    <div className="history-select-container">
      <label className="input-label">Прошлые задачи</label>
      <CustomSelect
        options={options}
        onSelect={handleSelect}
        placeholder="Новая задача"
      />
    </div>
  );
}

export default HistorySelect;