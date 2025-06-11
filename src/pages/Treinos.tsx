import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '../styles/Treinos.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { UserProfile } from '../types/User';

// As suas tipagens e constantes continuam iguais
type Booking = { memberId: string; time: string; memberName: string; };
type DayBookings = Booking[];
type Bookings = Record<string, DayBookings>;
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Treinos: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Bookings>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        setLoading(true);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user, db]);

  useEffect(() => {
    if (userProfile?.teamId) {
      const teamId = userProfile.teamId;
      const unsubscribes = daysOfWeek.map(day => {
        const docRef = doc(db, 'teams', teamId, 'treinos', day);
        return onSnapshot(docRef, (docSnap) => {
          const data = docSnap.data();
          const dayBookings = (data?.bookings && Array.isArray(data.bookings) ? data.bookings : []) as DayBookings;
          setBookings(prev => ({ ...prev, [day]: dayBookings }));
        });
      });
      return () => unsubscribes.forEach(unsub => unsub());
    } else {
        setBookings({});
    }
  }, [userProfile, db]);

  const saveDayBookings = useCallback(async (day: string, dayBookings: DayBookings) => {
    if (!userProfile?.teamId) return;
    await setDoc(doc(db, 'teams', userProfile.teamId, 'treinos', day), { bookings: dayBookings });
  }, [db, userProfile?.teamId]);

  const addBooking = useCallback(() => {
      if (!selectedDay || !startTime || !endTime || !user || !userProfile?.nick) return alert('Selecione um dia, horário e esteja logado com um perfil completo.');
      const startIndex = HOURS.indexOf(startTime);
      const endIndex = HOURS.indexOf(endTime);
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return alert('Horário inválido.');
      const intervalHours = HOURS.slice(startIndex, endIndex);
      const currentDayBookings = bookings[selectedDay] || [];
      if (intervalHours.some(hour => currentDayBookings.some(b => b.time === hour))) return alert('Horário já ocupado.');
      const newEntries: Booking[] = intervalHours.map(hour => ({ memberId: user.uid, time: hour, memberName: userProfile.nick }));
      saveDayBookings(selectedDay, [...currentDayBookings, ...newEntries]);
      setSelectedDay(null);
      setStartTime('');
      setEndTime('');
  }, [selectedDay, startTime, endTime, user, userProfile, bookings, saveDayBookings]);

  const removeInterval = useCallback((day: string, interval: { memberId: string; start: string; end: string; }) => {
      if (!user || user.uid !== interval.memberId) return alert('Só pode desmarcar seus próprios treinos.');
      const intervalHoursToRemove = new Set(HOURS.slice(HOURS.indexOf(interval.start), HOURS.indexOf(interval.end)));
      const currentDayBookings = bookings[day] || [];
      const updatedBookings = currentDayBookings.filter(booking => !(booking.memberId === user.uid && intervalHoursToRemove.has(booking.time)));
      saveDayBookings(day, updatedBookings);
  }, [user, bookings, saveDayBookings]);

  const groupedIntervalsByDay = useMemo(() => {
    const result: Record<string, { memberId: string; start: string; end: string; memberName: string; }[]> = {};
    for (const day of daysOfWeek) {
        const dayBookings = bookings[day] || [];
        if (dayBookings.length === 0) {
            result[day] = [];
            continue;
        }
        const sorted = [...dayBookings].sort((a, b) => HOURS.indexOf(a.time) - HOURS.indexOf(b.time));
        const intervals = [];
        let currentInterval: { memberId: string; start: string; end: string; memberName: string; } | null = null;
        
        for (const booking of sorted) {
            if (currentInterval !== null) {
                // Se já existe um intervalo, verificamos se podemos estendê-lo
                const isSameUser = currentInterval.memberId === booking.memberId;
                const isConsecutive = currentInterval.end === booking.time;

                if (isSameUser && isConsecutive) {
                    currentInterval.end = HOURS[HOURS.indexOf(booking.time) + 1];
                } else {
                    // Se não, o intervalo anterior terminou. Adicionamo-lo à lista.
                    intervals.push(currentInterval);
                    // E começamos um novo intervalo com o booking atual.
                    currentInterval = {
                        memberId: booking.memberId,
                        start: booking.time,
                        end: HOURS[HOURS.indexOf(booking.time) + 1],
                        memberName: booking.memberName,
                    };
                }
            } else {
                // Se não há intervalo a ser processado, este é o primeiro.
                currentInterval = {
                    memberId: booking.memberId,
                    start: booking.time,
                    end: HOURS[HOURS.indexOf(booking.time) + 1],
                    memberName: booking.memberName,
                };
            }
        }
        // Adiciona o último intervalo que estava a ser processado
        if (currentInterval) {
            intervals.push(currentInterval);
        }
        result[day] = intervals;
    }
    return result;
  }, [bookings]);


  if (loading) return <p className={styles.loading}>A carregar agenda...</p>;
  if (!user) return <div className={styles.container}><p className={styles.warning}>Você precisa estar logado.</p></div>;
  if (!userProfile?.teamId) {
    return <div className={styles.container}><p className={styles.warning}>Você não pertence a nenhuma equipa.</p></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Agenda de Treinos da Equipa</h2>
      <div className={styles.week}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.day} onClick={() => setSelectedDay(day)} title="Clique para marcar um treino neste dia">
            <h3>{day}</h3>
            {(groupedIntervalsByDay[day] || []).length === 0 ? (
              <p className={styles.empty}>Nenhuma marcação</p>
            ) : (
              groupedIntervalsByDay[day].map((interval) => (
                <div key={`${interval.memberId}-${interval.start}`} className={styles.timeSlot}>
                  {interval.memberName || '...'} - {interval.start} até {interval.end}
                  {user?.uid === interval.memberId && (
                    <button
                      className={styles.removeButton}
                      title="Desmarcar este treino"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInterval(day, interval);
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
      {selectedDay && (
        <div className={styles.form}>
          <h3>Marcar treino para {selectedDay}</h3>
          <label>Início:
            <select value={startTime} onChange={e => setStartTime(e.target.value)}>
              <option value="">Selecionar</option>
              {HOURS.slice(0, -1).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
          <label>Fim:
            <select value={endTime} onChange={e => setEndTime(e.target.value)}>
              <option value="">Selecionar</option>
              {HOURS.slice(1).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
          <button className={styles.confirmButton} onClick={addBooking}>Marcar</button>
          <button className={styles.cancelButton} onClick={() => setSelectedDay(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Treinos;