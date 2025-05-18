import React, { useState, useEffect } from 'react';
import styles from '../styles/Treinos.module.css';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc,  setDoc, collection, getDocs } from 'firebase/firestore';

type Booking = {
  memberId: string;
  time: string;
};

type DayBookings = Booking[];
type Bookings = Record<string, DayBookings>;

// Para armazenar os nicks de cada userId
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
  const [selectedTime, setSelectedTime] = useState('');
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
        // 1. Buscar todos os treinos
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

        // 2. Buscar todos os users pra pegar nicknames
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

  const addBooking = () => {
    if (!selectedDay || !selectedTime || !user) return;

    const dayBookings = bookings[selectedDay] || [];

    const alreadyBooked = dayBookings.find(
      (b) => b.memberId === user.uid && b.time === selectedTime
    );
    if (alreadyBooked) {
      alert('Você já marcou este horário neste dia.');
      return;
    }

    const countSameTime = dayBookings.filter((b) => b.time === selectedTime).length;
    if (countSameTime >= MAX_MEMBERS) {
      alert('Este horário já está cheio para este dia.');
      return;
    }

    const updatedTrainings: Bookings = {
      ...bookings,
      [selectedDay]: [...dayBookings, { memberId: user.uid, time: selectedTime }],
    };

    setBookings(updatedTrainings);
    saveBookings(updatedTrainings);
    setSelectedTime('');
    setSelectedDay(null);
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
                dayBookings.map((booking, i) => {
                  // Pega o nick ou mostra o UID cortado se não achar nick
                  const nick = usernames[booking.memberId] || booking.memberId.slice(0, 6);
                  return (
                    <div key={i} className={styles.timeSlot}>
                      Jogador {nick} - {booking.time}
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
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione o horário</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <button onClick={addBooking} className={styles.confirmButton}>Confirmar</button>
            <button onClick={() => {
              setSelectedDay(null);
              setSelectedTime('');
            }} className={styles.cancelButton}>Cancelar</button>
          </div>
        </div>
      )}

      <p className={styles.footerInfo}>
        Toque em um dia da semana para escolher seu horário de treino.
      </p>
    </div>
  );
};

export default Treinos;
