import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- React Component ---

function Stats({ history, darkMode }) { // Получаем history как проп
  const [stats, setStats] = useState({});
  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
    if (!history || history.length === 0) return;

    const getPeriodStart = (period) => {
      const now = new Date();
      switch (period) {
        case 'today':
          return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        case 'week':
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
          return new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate()).getTime();
        case 'month':
          return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        case 'all':
        default:
          return 0;
      }
    };

    const calculateStatsForPeriod = (period) => {
      const start = getPeriodStart(period);
      return history
        .filter(session => session.startTime >= start)
        .reduce((acc, session) => {
          const mins = Math.round(session.elapsed / 60);
          acc[session.tag] = (acc[session.tag] || 0) + mins;
          return acc;
        }, {});
    };

    const getTotal = (periodStats) => Object.values(periodStats).reduce((sum, val) => sum + val, 0);

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

  const formatMinutes = (mins) => {
    if (mins === 0) return '0 мин';
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours} ч ${remMins} мин`;
    return `${remMins} мин`;
  };

  const allTags = stats.all ? Object.keys(stats.all.stats).sort() : [];

  // --- Chart Configuration ---
  const chartData = {
    labels: stats[chartPeriod] ? Object.keys(stats[chartPeriod].stats) : [],
    datasets: [
      {
        data: stats[chartPeriod] ? Object.values(stats[chartPeriod].stats) : [],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderColor: 'var(--bg-secondary)', // Для красивых отступов между сегментами
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#9ca3af' : '#6b7280', // Цвет текста легенды
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatMinutes(context.parsed)}`
        }
      }
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold">Нет данных для статистики</h2>
        <p className="text-secondary mt-2">Начните использовать таймер, чтобы увидеть здесь свою продуктивность!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Сводные карточки */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-card-title">Сегодня</h3>
          <p className="stat-card-value">{formatMinutes(stats.today?.total || 0)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card-title">Эта неделя</h3>
          <p className="stat-card-value">{formatMinutes(stats.week?.total || 0)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card-title">Этот месяц</h3>
          <p className="stat-card-value">{formatMinutes(stats.month?.total || 0)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card-title">Все время</h3>
          <p className="stat-card-value">{formatMinutes(stats.all?.total || 0)}</p>
        </div>
      </div>

      {/* Диаграмма */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-center">Распределение времени</h2>
        <div className="chart-period-selector">
          {['today', 'week', 'month', 'all'].map(period => (
            <button 
              key={period}
              onClick={() => setChartPeriod(period)}
              className={`period-btn ${chartPeriod === period ? 'active' : ''}`}>
              { {today: 'Сегодня', week: 'Неделя', month: 'Месяц', all: 'Все время'}[period] }
            </button>
          ))}
        </div>
        <div className="chart-container">
          {stats[chartPeriod]?.total > 0 ? (
            <Pie data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Нет данных за этот период.</p>
          )}
        </div>
      </div>

      {/* Таблица с деталями */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Детализация по тегам</h2>
        <div className="table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Тег</th>
                <th>Сегодня</th>
                <th>Неделя</th>
                <th>Месяц</th>
                <th>Все время</th>
              </tr>
            </thead>
            <tbody>
              {allTags.map(tag => (
                <tr key={tag}>
                  <td className="font-bold">{tag}</td>
                  <td className="text-center">{formatMinutes(stats.today?.stats[tag] || 0)}</td>
                  <td className="text-center">{formatMinutes(stats.week?.stats[tag] || 0)}</td>
                  <td className="text-center">{formatMinutes(stats.month?.stats[tag] || 0)}</td>
                  <td className="text-center">{formatMinutes(stats.all?.stats[tag] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stats;