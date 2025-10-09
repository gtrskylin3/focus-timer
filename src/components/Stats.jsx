// src/components/Stats.jsx
import { useState, useEffect } from 'react';

function Stats() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});  // { today: {tag: mins}, week: {...}, ... }

  useEffect(() => {
    // Загрузка истории (дублируем из App)
    const savedHistory = localStorage.getItem('focusTimerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (history.length === 0) return;

    // JS: Функция для start периода (мс)
    const getPeriodStart = (period) => {
      const now = Date.now();
      switch (period) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return today.getTime();
        case 'week':
          return now - 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now - 30 * 24 * 60 * 60 * 1000;
        case 'all':
          return 0;  // Начало времён
        default:
          return 0;
      }
    };

    // Вычисление для периода: Группировка по тегам, сумма elapsed (в мин)
    const calculateStatsForPeriod = (period) => {
      const start = getPeriodStart(period);
      return history
        .filter(session => session.startTime >= start)
        .reduce((acc, session) => {
          const mins = Math.round(session.elapsed / 60);  // elapsed в сек → мин
          acc[session.tag] = (acc[session.tag] || 0) + mins;
          return acc;
        }, {});
    };

    // Общее: Сумма по всем тегам для периода
    const getTotal = (periodStats) => {
      return Object.values(periodStats).reduce((sum, val) => sum + val, 0);
    };

    const todayStats = calculateStatsForPeriod('today');
    const weekStats = calculateStatsForPeriod('week');
    const monthStats = calculateStatsForPeriod('month');
    const allStats = calculateStatsForPeriod('all');

    setStats({
      today: { stats: todayStats, total: getTotal(todayStats) },
      week: { stats: weekStats, total: getTotal(weekStats) },
      month: { stats: monthStats, total: getTotal(monthStats) },
      all: { stats: allStats, total: getTotal(allStats) }
    });
  }, [history]);

  // JS: Формат мин в читаемый
  const formatMinutes = (mins) => {
    if (mins === 0) return '0 мин';
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours} ч ${remMins} мин`;
    return `${mins} мин`;
  };

  // Все теги (из allStats)
  const allTags = stats.all ? Object.keys(stats.all.stats) : [];

  if (history.length === 0) {
    return <div className="app-container"><p className="text-center text-lg">Нет сессий для статистики. Начните таймер!</p></div>;
  }

  return (
    <div className="app-container p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Статистика сессий</h1>

      {/* Карточки общих итогов */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center">
          <h2 className="font-bold">Сегодня</h2>
          <p className="text-2xl">{formatMinutes(stats.today?.total || 0)}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded text-center">
          <h2 className="font-bold">Неделя</h2>
          <p className="text-2xl">{formatMinutes(stats.week?.total || 0)}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded text-center">
          <h2 className="font-bold">Месяц</h2>
          <p className="text-2xl">{formatMinutes(stats.month?.total || 0)}</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
          <h2 className="font-bold">Все время</h2>
          <p className="text-2xl">{formatMinutes(stats.all?.total || 0)}</p>
        </div>
      </div>

      {/* Таблица: Responsive (скролл на моб) */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 p-2">Тег</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Сегодня</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Неделя</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Месяц</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Все время</th>
            </tr>
          </thead>
          <tbody>
            {allTags.map(tag => (
              <tr key={tag} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">{tag}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{formatMinutes(stats.today?.stats[tag] || 0)}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{formatMinutes(stats.week?.stats[tag] || 0)}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{formatMinutes(stats.month?.stats[tag] || 0)}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{formatMinutes(stats.all?.stats[tag] || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Stats;