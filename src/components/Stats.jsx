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
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Если воскресенье (0), то смещаемся на 6 дней назад, иначе на (day - 1)
          weekStart.setHours(0, 0, 0, 0);
          return weekStart.getTime();
        }
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
        backgroundColor: ['#ff00ff', '#8000ff', '#d900ff', '#8400ff', '#ff4081', '#5555ff'], // Neon colors from the theme
        borderColor: '#0a0a1a', // --bg-primary
        borderWidth: 3,
        hoverBorderColor: '#e0e0ff', // --text-primary
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
        <h2 className="text-xl font-bold mb-2">Детализация по тегам</h2>
        <p className="text-secondary mb-4">
          { {today: 'Данные за сегодня', week: 'Данные за неделю', month: 'Данные за месяц', all: 'Данные за все время'}[chartPeriod] }
        </p>
        <div className="table-container">
          {
            (() => {
              const periodStats = stats[chartPeriod]?.stats || {};
              const periodTags = Object.keys(periodStats).filter(tag => periodStats[tag] > 0).sort((a, b) => periodStats[b] - periodStats[a]);

              if (periodTags.length === 0) {
                return <p className="text-center text-secondary py-8">Нет данных для отображения.</p>;
              }

              return (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Тег</th>
                      <th className="time-col">Время</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodTags.map(tag => (
                      <tr key={tag}>
                        <td className="font-bold">{tag}</td>
                        <td className="time-col">{formatMinutes(periodStats[tag] || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          }
        </div>
      </div>
    </div>
  );
}

export default Stats;