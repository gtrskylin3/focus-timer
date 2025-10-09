// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router';
import TaskInput from './components/TaskInput.jsx';
import HistorySelect from './components/HistorySelect.jsx';
import Stats from './components/Stats.jsx';

function App() {
  const [tag, setTag] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [savedInitialTime, setSavedInitialTime] = useState(null);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);  // Новый: Флаг загрузки, чтобы избежать race

  const initialTime = durationInMinutes ? parseInt(durationInMinutes) * 60 : null;

  // Загрузка из localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('focusTimerState');
    console.log('Loading state from localStorage:', savedState);  // Дебаг
    if (savedState) {
      const parsed = JSON.parse(savedState);
      console.log('Parsed state:', parsed);  // Дебаг
      setTag(parsed.tag || '');
      setDurationInMinutes(parsed.durationInMinutes || '');
      setTimeLeft(parsed.timeLeft || 0);
      setIsRunning(parsed.isRunning || false);
      setElapsedTime(parsed.elapsedTime || 0);
      setSavedInitialTime(parsed.savedInitialTime || null);
      setStartTimestamp(parsed.startTimestamp || null);
    }

    const savedHistory = localStorage.getItem('focusTimerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedDarkMode = localStorage.getItem('focusTimerDarkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    setIsLoaded(true);  // Флаг: Загрузка завершена
  }, []);

  // Новый useEffect: После загрузки, если running, перезапускаем таймер (фикс race condition)
  useEffect(() => {
    if (isLoaded && isRunning) {
      console.log('Resuming timer after load:', { timeLeft, elapsedTime, savedInitialTime });  // Дебаг
      // Здесь можно вручную setInterval, но лучше полагаться на основной эффект (он перезапустится по зависимостям)
    }
  }, [isLoaded, isRunning]);

  // Автосохранение
  useEffect(() => {
    if (!isLoaded) return;  // Не сохраняем до полной загрузки
    const stateToSave = {
      tag,
      durationInMinutes,
      timeLeft,
      isRunning,
      elapsedTime,
      savedInitialTime,
      startTimestamp
    };
    console.log('Saving state:', stateToSave);  // Дебаг
    localStorage.setItem('focusTimerState', JSON.stringify(stateToSave));
    localStorage.setItem('focusTimerDarkMode', JSON.stringify(darkMode));
  }, [tag, durationInMinutes, timeLeft, isRunning, elapsedTime, savedInitialTime, startTimestamp, darkMode, isLoaded]);

  // Toggle dark
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Логика таймера: Добавил isLoaded в зависимости (чтобы не стартовал до загрузки)
  useEffect(() => {
    if (!isLoaded) return;  // Фикс: Не запускаем до полной загрузки

    let intervalId;

    if (isRunning) {
      console.log('Starting interval:', { savedInitialTime, timeLeft });  // Дебаг
      if (savedInitialTime !== null && timeLeft > 0) {
        intervalId = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              completeSession(savedInitialTime, elapsedTime + 1, startTimestamp);
            }
            return newTime;
          });
          setElapsedTime(prev => prev + 1);
        }, 1000);
      } else if (savedInitialTime === null) {
        intervalId = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft, savedInitialTime, startTimestamp, isLoaded]);  // Добавили isLoaded

  // Сохранение истории
  useEffect(() => {
    localStorage.setItem('focusTimerHistory', JSON.stringify(history));
  }, [history]);

  // Функции (без изменений)
  const completeSession = (initTime, elapsed, startTime) => {
    const session = {
      id: Date.now(),
      tag,
      duration: initTime ? initTime / 60 : null,
      startTime: startTime || Date.now() - elapsed * 1000,
      endTime: Date.now(),
      elapsed
    };
    setHistory(prev => [...prev, session]);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (tag.trim() === '') {
      alert('Введите тег!');
      return;
    }
    setSavedInitialTime(initialTime);
    setStartTimestamp(Date.now());
    setIsRunning(true);
    setElapsedTime(0);
    if (initialTime !== null) {
      setTimeLeft(initialTime);
    }
  };

  const handlePause = () => setIsRunning(false);

  const handleStop = () => {
    if (isRunning && elapsedTime > 0) {
      completeSession(savedInitialTime, elapsedTime, startTimestamp);
    } else {
      setIsRunning(false);
      setElapsedTime(0);
      if (initialTime !== null) setTimeLeft(initialTime);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setSavedInitialTime(null);
    setStartTimestamp(null);
    if (initialTime !== null) setTimeLeft(initialTime);
  };

  const handleHistorySelect = (selectedTag, selectedDuration) => {
    setTag(selectedTag);
    setDurationInMinutes(selectedDuration);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const displayTime = savedInitialTime !== null ? timeLeft : elapsedTime;
  const formatTime = (seconds) => {
    if (seconds === null) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const progress = savedInitialTime !== null ? (elapsedTime / savedInitialTime) * 100 : 0;

  // Return (как в объединённом коде)
  return (
    <>
      <nav className="p-4 bg-gray-200 dark:bg-gray-700 flex justify-center">
        <Link to="/" className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Таймер
        </Link>
        <Link to="/stats" className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Статистика
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <div className="input-section">
                <h1 className="mb-6">Focus Timer</h1>
                <button
                  onClick={toggleDarkMode}
                  className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
                >
                  {darkMode ? '☀️ Светлая' : '🌙 Тёмная'}
                </button>
                <HistorySelect history={history} onSelect={handleHistorySelect} />
                <TaskInput
                  tag={tag}
                  durationInMinutes={durationInMinutes}
                  onTagChange={setTag}
                  onDurationChange={setDurationInMinutes}
                />
              </div>

              <div className="timer-section">
                <svg width="200" height="200" viewBox="0 0 200 200" className="timer-circle">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:text-gray-600" />
                  {savedInitialTime !== null && (
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="var(--accent-blue)"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 80} ${2 * Math.PI * 80}`}
                      strokeDashoffset={`${(1 - progress / 100) * 2 * Math.PI * 80}`}
                      transform="rotate(-90 100 100)"
                      className="transition-all duration-1000 ease-linear"
                    />
                  )}
                </svg>

                <div className="time-display">{formatTime(displayTime)}</div>
                {tag && <div className="tag-display">{tag}</div>}

                <div className="buttons-container">
                  <button onClick={handleStart} disabled={isRunning || !tag.trim()} className="start-btn">
                    Старт
                  </button>
                  <button onClick={handlePause} disabled={!isRunning} className="pause-btn">
                    Пауза
                  </button>
                  <button onClick={handleStop} disabled={!isRunning} className="stop-btn">
                    Стоп (завершить сессию)
                  </button>
                  <button onClick={handleReset} className="reset-btn">
                    Сброс
                  </button>
                </div>

                <p className="info-text mt-4">
                  Режим: {savedInitialTime !== null ? 'Обратный отсчёт' : 'Накопление времени'} | Сессий в истории: {history.length}
                </p>
              </div>
            </div>
          }
        />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </>
  );
}

export default App;