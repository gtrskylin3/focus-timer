import { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink } from 'react-router';
import TaskInput from './components/TaskInput.jsx';
import HistorySelect from './components/HistorySelect.jsx';
import Stats from './components/Stats.jsx';
import CompletionModal from './components/CompletionModal.jsx';
import { quotes } from './quotes.js';

// --- Helper Functions ---

// Загрузка начального состояния таймера из localStorage
const getInitialTimerState = () => {
  try {
    const savedState = localStorage.getItem('focusTimerState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        tag: parsed.tag || '',
        hours: parsed.hours || '',
        minutes: parsed.minutes || '',
        durationInMinutes: parsed.durationInMinutes || '',
        timeLeft: parsed.timeLeft || 0,
        isRunning: false, // Всегда начинаем в состоянии паузы при перезагрузке
        elapsedTime: parsed.elapsedTime || 0,
        savedInitialTime: parsed.savedInitialTime || null,
        startTimestamp: parsed.startTimestamp || null,
      };
    }
  } catch (error) {
    console.error("Ошибка чтения состояния таймера из localStorage", error);
  }
  return {
    tag: '',
    hours: '',
    minutes: '',
    durationInMinutes: '',
    timeLeft: 0,
    isRunning: false,
    elapsedTime: 0,
    savedInitialTime: null,
    startTimestamp: null,
  };
};

// Загрузка истории из localStorage
const getInitialHistory = () => {
  try {
    const savedHistory = localStorage.getItem('focusTimerHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Ошибка чтения истории из localStorage", error);
    return [];
  }
};

// Загрузка темы из localStorage
const getInitialDarkMode = () => {
  const savedDarkMode = localStorage.getItem('focusTimerDarkMode');
  return savedDarkMode !== null ? JSON.parse(savedDarkMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// --- React Component ---

function App() {
  const [timerState, setTimerState] = useState(getInitialTimerState);
  const { tag, hours, minutes, durationInMinutes, timeLeft, isRunning, elapsedTime, savedInitialTime, startTimestamp } = timerState;
  
  const [history, setHistory] = useState(getInitialHistory);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const audioRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);


  const calculateTotalTagTime = (currentTag) => {
    return history
      .filter(session => session.tag === currentTag)
      .reduce((total, session) => total + session.elapsed, 0);
  };

  // --- Effects ---

  // Сохранение состояния в localStorage
  useEffect(() => {
    localStorage.setItem('focusTimerState', JSON.stringify(timerState));
  }, [timerState]);

  useEffect(() => {
    localStorage.setItem('focusTimerHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('focusTimerDarkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Основная логика таймера
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimerState(prev => {
          if (!prev.startTimestamp) return prev; // Защита

          const elapsed = Math.floor((Date.now() - prev.startTimestamp) / 1000);

          // Режим обратного отсчета
          if (prev.savedInitialTime !== null) {
            const newTimeLeft = prev.savedInitialTime - elapsed;
            if (newTimeLeft <= 0) {
              if (audioRef.current) {
                audioRef.current.play();
              }

              const totalTagTime = calculateTotalTagTime(prev.tag) + prev.savedInitialTime;
              const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

              setModalData({
                sessionDuration: prev.savedInitialTime,
                totalTagTime: totalTagTime,
                quote: randomQuote,
                tag: prev.tag,
              });
              setIsModalOpen(true);

              completeSession(prev.savedInitialTime, prev.savedInitialTime, prev.startTimestamp);
              return { ...prev, timeLeft: 0, isRunning: false, elapsedTime: prev.savedInitialTime };
            }
            return { ...prev, timeLeft: newTimeLeft, elapsedTime: elapsed };
          }
          
          // Режим накопления
          return { ...prev, elapsedTime: elapsed };
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTimestamp]);

  // --- Functions ---

  const completeSession = (initTime, elapsed, startTime) => {
    const session = {
      id: Date.now(),
      tag,
      duration: initTime ? initTime / 60 : null,
      startTime: startTime || Date.now() - elapsed * 1000,
      endTime: Date.now(),
      elapsed
    };
    setHistory(prev => [session, ...prev]);
  };

  const handleStart = () => {
    if (tag.trim() === '') {
      alert('Пожалуйста, введите тег для задачи.');
      return;
    }
    const newInitialTime = durationInMinutes ? parseInt(durationInMinutes) * 60 : null;
    setTimerState(prev => ({
      ...prev,
      savedInitialTime: newInitialTime,
      startTimestamp: Date.now() - prev.elapsedTime * 1000, // Учитываем уже прошедшее время при возобновлении
      isRunning: true,
      timeLeft: newInitialTime !== null ? (prev.timeLeft > 0 && prev.timeLeft < newInitialTime ? prev.timeLeft : newInitialTime) : 0,
    }));
  };

  const handlePause = () => setTimerState(prev => ({ ...prev, isRunning: false }));

  const handleStop = () => {
    if (elapsedTime > 0) {
      completeSession(savedInitialTime, elapsedTime, startTimestamp);
    }
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      savedInitialTime: null,
      startTimestamp: null,
      timeLeft: 0,
    }));
  };

  const handleReset = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      timeLeft: prev.savedInitialTime !== null ? prev.savedInitialTime : 0,
    }));
  };

  const handleHistorySelect = (selectedTag, selectedDuration) => {
    const newInitialTime = selectedDuration ? parseInt(selectedDuration) * 60 : null;
    const newHours = selectedDuration ? Math.floor(selectedDuration / 60).toString() : '';
    const newMinutes = selectedDuration ? (selectedDuration % 60).toString() : '';

    setTimerState(prev => ({
      ...prev,
      tag: selectedTag,
      durationInMinutes: selectedDuration,
      hours: newHours,
      minutes: newMinutes,
      elapsedTime: 0,
      timeLeft: newInitialTime || 0,
      savedInitialTime: newInitialTime,
      isRunning: false,
    }));
  };

  const handleDurationChange = ({ hours: newHours, minutes: newMinutes }) => {
    const currentHours = newHours !== undefined ? newHours : hours;
    const currentMinutes = newMinutes !== undefined ? newMinutes : minutes;

    const hoursNum = currentHours === '' ? 0 : parseInt(currentHours, 10);
    const minutesNum = currentMinutes === '' ? 0 : parseInt(currentMinutes, 10);

    if (isNaN(hoursNum) || isNaN(minutesNum)) return;

    const totalMinutes = hoursNum * 60 + minutesNum;

    if (totalMinutes > 16 * 60) {
      alert('Максимальная продолжительность таймера - 16 часов.');
      return;
    }

    const newDurationInMinutes = totalMinutes > 0 ? String(totalMinutes) : '';

    setTimerState(prev => ({
      ...prev,
      hours: currentHours,
      minutes: currentMinutes,
      durationInMinutes: newDurationInMinutes,
    }));
  };

  // --- Render Helpers ---

  const displayTime = savedInitialTime !== null ? timeLeft : elapsedTime;
  const formatTime = (seconds) => {
    if (seconds === null) return '∞';
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString()}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const progress = savedInitialTime > 0 ? (elapsedTime / savedInitialTime) * 100 : 0;

  return (
    <div className="main-container">
      <nav className="main-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Таймер</NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Статистика</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={
          <div className="timer-page-grid">
            <div className="card">
              <div className="input-group">
                <HistorySelect history={history} onSelect={handleHistorySelect} />
                <TaskInput
                  tag={tag}
                  hours={hours}
                  minutes={minutes}
                  onTagChange={(newTag) => setTimerState(prev => ({ ...prev, tag: newTag }))}
                  onDurationChange={handleDurationChange}
                />
              </div>
            </div>

            <div className="card timer-display-section">
              <div className="timer-circle-container">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="100" stroke="var(--bg-tertiary)" strokeWidth="12" fill="none" />
                  {savedInitialTime !== null && (
                    <circle
                      cx="110" cy="110" r="100"
                      stroke="var(--link-active)" strokeWidth="12" fill="none"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${(1 - progress / 100) * 2 * Math.PI * 100}`}
                      transform="rotate(-90 110 110)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  )}
                </svg>
                <div className="timer-text-content">
                  <div 
                    className="timer-time"
                    style={{ fontSize: formatTime(displayTime).length > 5 ? '2.5rem' : '3.5rem' }}
                  >
                    {formatTime(displayTime)}
                  </div>
                  {tag && <div className="timer-tag">{tag}</div>}
                </div>
              </div>

              <div className="timer-buttons">
                <button onClick={handleStart} disabled={isRunning || !tag.trim()} className="timer-btn btn-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  <span>{elapsedTime > 0 && !isRunning ? 'Продолжить' : 'Старт'}</span>
                </button>
                <button onClick={handlePause} disabled={!isRunning} className="timer-btn btn-pause">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  <span>Пауза</span>
                </button>
                <button onClick={handleStop} disabled={elapsedTime === 0} className="timer-btn btn-stop">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                  <span>Стоп</span>
                </button>
                <button onClick={handleReset} disabled={elapsedTime === 0} className="timer-btn btn-reset">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                  <span>Сброс</span>
                </button>
              </div>
            </div>
          </div>
        } />
        <Route path="/stats" element={<Stats history={history} setHistory={setHistory} darkMode={darkMode} />} />
      </Routes>
      <audio ref={audioRef} src="/notification.mp3" />
      <CompletionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimerState(prev => ({
            ...prev,
            isRunning: false,
            elapsedTime: 0,
            savedInitialTime: prev.durationInMinutes ? parseInt(prev.durationInMinutes) * 60 : null,
            startTimestamp: null,
            timeLeft: prev.durationInMinutes ? parseInt(prev.durationInMinutes) * 60 : 0,
          }));
        }}
        sessionData={modalData}
      />
    </div>
  );
}

export default App;
