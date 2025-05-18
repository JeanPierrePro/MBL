// Treinos.tsx

import React, { useState, useEffect } from 'react';
import styles from '../styles/Treinos.module.css';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

type Booking = {
  memberId: string;
  time: string;
};

type DayBookings = Booking[];
type Bookings = Record<string, DayBookings>;
type Usernames = Record<string, string>;

const MAX_MEMBERS = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' + i : i}:00`);
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Treinos: React.FC = () => {
  const auth = getAuth();
  const db = getFirestore();

  const [bookings, setBookings] = useState<Bookings>({});
  const [usernames, setUsernames] = useState<Usernames>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    async function loadBookingsAndUsernames() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const treinosSnapshot = await getDocs(collection(db, 'treinos'));
        const allBookings: Bookings = {};

        treinosSnapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.bookings) {
            const bookings = data.bookings;
            for (const day in bookings) {
              if (!allBookings[day]) allBookings[day] = [];
              allBookings[day] = allBookings[day].concat(bookings[day]);
            }
          }
        });

        setBookings(allBookings);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersMap: Usernames = {};

        usersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.nick && doc.id) {
            usersMap[doc.id] = data.nick;
          }
        });

        setUsernames(usersMap);
      } catch (error) {
        console.error('Erro ao carregar treinos ou usuários:', error);
      }
      setLoading(false);
    }

    loadBookingsAndUsernames();
  }, [db, user]);

  const saveBookings = async (newBookings: Bookings) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'treinos', currentUser.uid), { bookings: newBookings });
    } catch (error) {
      console.error('Erro ao salvar treinos:', error);
    }
  };

  const getIntervalHours = (start: string, end: string) => {
    const startIndex = HOURS.indexOf(start);
    const endIndex = HOURS.indexOf(end);
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return [];

    return HOURS.slice(startIndex, endIndex);
  };

  const addBooking = () => {
    if (!selectedDay || !startTime || !endTime || !user) return;

    const intervalHours = getIntervalHours(startTime, endTime);
    if (intervalHours.length === 0) {
      alert('Horário inválido: o horário de início deve ser antes do de término.');
      return;
    }

    const dayBookings = bookings[selectedDay] || [];
    for (const hour of intervalHours) {
      const count = dayBookings.filter(b => b.time === hour).length;
      if (count >= MAX_MEMBERS) {
        alert(`Horário ${hour} já está cheio.`);
        return;
      }

      const alreadyBooked = dayBookings.find(b => b.memberId === user.uid && b.time === hour);
      if (alreadyBooked) {
        alert(`Você já marcou o horário ${hour} neste dia.`);
        return;
      }
    }

    const newEntries = intervalHours.map(hour => ({
      memberId: user.uid,
      time: hour,
    }));

    const updatedTrainings: Bookings = {
      ...bookings,
      [selectedDay]: [...dayBookings, ...newEntries],
    };

    setBookings(updatedTrainings);
    saveBookings(updatedTrainings);
    setStartTime('');
    setEndTime('');
    setSelectedDay(null);
  };

  // Função para converter horários "HH:mm" em número para facilitar comparação
  const timeToNumber = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Função que agrupa horários consecutivos do mesmo jogador em intervalos
  const groupIntervals = (bookings: Booking[]) => {
    const byPlayer: Record<string, string[]> = {};

    bookings.forEach(({ memberId, time }) => {
      if (!byPlayer[memberId]) byPlayer[memberId] = [];
      byPlayer[memberId].push(time);
    });

    for (const memberId in byPlayer) {
      byPlayer[memberId].sort();
    }

    const intervals: { memberId: string; start: string; end: string }[] = [];

    for (const memberId in byPlayer) {
      const times = byPlayer[memberId].map(timeToNumber);
      let startIndex = 0;

      for (let i = 1; i <= times.length; i++) {
        if (i === times.length || times[i] !== times[i - 1] + 60) {
          intervals.push({
            memberId,
            start: HOURS.find(h => timeToNumber(h) === times[startIndex]) || '',
            end: HOURS.find(h => timeToNumber(h) === times[i - 1]) || '',
          });
          startIndex = i;
        }
      }
    }

    return intervals;
  };

  const getDayColor = (day: string): string => {
    const dayBookings = bookings[day] || [];
    const count = dayBookings.length;

    if (count === 0) return '';
    if (count < MAX_MEMBERS) return 'red';

    const uniqueTimes = new Set(dayBookings.map((b) => b.time));
    if (uniqueTimes.size === 1) return 'green';

    return 'yellow';
  };

  if (!user) {
    return <p className={styles.warning}>Você precisa estar logado para ver e marcar treinos.</p>;
  }

  if (loading) {
    return <p className={styles.loading}>Carregando treinos...</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Agenda de Treinos Semanais</h2>

      <div className={styles.week}>
        {daysOfWeek.map((day) => {
          const dayColor = getDayColor(day);
          const dayBookings = bookings[day] || [];

          return (
            <div
              key={day}
              className={`${styles.day} ${dayColor ? styles[dayColor] : ''}`}
              onClick={() => setSelectedDay(day)}
              title="Clique para marcar um treino neste dia"
            >
              <h3>{day}</h3>
              {dayBookings.length === 0 ? (
                <p className={styles.empty}>Nenhuma marcação</p>
              ) : (
                groupIntervals(dayBookings).map(({ memberId, start, end }, i) => {
                  const nick = usernames[memberId] || memberId.slice(0, 6);
                  return (
                    <div key={i} className={styles.timeSlot}>
                      Jogador {nick} - {start === end ? start : `${start} até ${end}`}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className={styles.bookingArea}>
          <h3>Marcar treino para <strong>{selectedDay}</strong></h3>
          <div className={styles.selector}>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.select}
            >
              <option value="">Início</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.select}
            >
              <option value="">Fim</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <button onClick={addBooking} className={styles.confirmButton}>Confirmar</button>
            <button onClick={() => {
              setSelectedDay(null);
              setStartTime('');
              setEndTime('');
            }} className={styles.cancelButton}>Cancelar</button>
          </div>
        </div>
      )}

      <p className={styles.footerInfo}>
        Toque em um dia para marcar seus treinos. Até {MAX_MEMBERS} jogadores por hora.
      </p>
    </div>
  );
};

export default Treinos;
