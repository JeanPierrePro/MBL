import React, { useState, useEffect, useCallback } from 'react';
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

  // Converte horário "HH:mm" para número total de minutos
  const timeToNumber = useCallback((time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }, []);

  // Retorna array de horários no intervalo selecionado
  const getIntervalHours = useCallback((start: string, end: string) => {
    const startIndex = HOURS.indexOf(start);
    const endIndex = HOURS.indexOf(end);
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return [];
    return HOURS.slice(startIndex, endIndex);
  }, []);

  // Agrupa horários consecutivos do mesmo usuário em intervalos contínuos
  const groupIntervals = useCallback((dayBookings: Booking[]) => {
    const byPlayer: Record<string, string[]> = {};

    dayBookings.forEach(({ memberId, time }) => {
      if (!byPlayer[memberId]) byPlayer[memberId] = [];
      byPlayer[memberId].push(time);
    });

    const intervals: { memberId: string; start: string; end: string }[] = [];

    for (const memberId in byPlayer) {
      const sortedTimes = byPlayer[memberId]
        .map(time => ({ original: time, num: timeToNumber(time) }))
        .sort((a, b) => a.num - b.num);

      if (sortedTimes.length === 0) continue;

      let start = sortedTimes[0].original;
      let end = sortedTimes[0].original;

      for (let i = 1; i < sortedTimes.length; i++) {
        const current = sortedTimes[i];
        const prev = sortedTimes[i - 1];

        if (current.num === prev.num + 60) {
          end = current.original;
        } else {
          intervals.push({ memberId, start, end });
          start = current.original;
          end = current.original;
        }
      }

      intervals.push({ memberId, start, end });
    }

    return intervals;
  }, [timeToNumber]);

  // Carrega agendamentos e usuários do Firestore
  useEffect(() => {
    async function loadBookingsAndUsernames() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Pega todos os documentos da coleção 'treinos'
        const treinosSnapshot = await getDocs(collection(db, 'treinos'));
        const allBookingsRaw: Record<string, { memberId: string; time: string }[]> = {};

        treinosSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.bookings) {
            const bookingsData = data.bookings as Bookings;
            for (const day in bookingsData) {
              if (!allBookingsRaw[day]) allBookingsRaw[day] = [];
              allBookingsRaw[day] = allBookingsRaw[day].concat(bookingsData[day]);
            }
          }
        });

        // Novo processamento para agrupar os horários ao carregar
        const groupedBookings: Bookings = {};
        for (const day in allBookingsRaw) {
          groupedBookings[day] = groupIntervals(allBookingsRaw[day]).flatMap(interval => {
            const intervalHours = getIntervalHours(interval.start, interval.end);
            return intervalHours.map(hour => ({ memberId: interval.memberId, time: hour }));
          });
        }

        setBookings(groupedBookings);

        // Pega todos os usuários para mostrar o nick
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersMap: Usernames = {};

        usersSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.nick && docSnap.id) {
            usersMap[docSnap.id] = data.nick;
          }
        });

        setUsernames(usersMap);
      } catch (error) {
        console.error('Erro ao carregar treinos ou usuários:', error);
      }
      setLoading(false);
    }

    loadBookingsAndUsernames();
  }, [db, user, groupIntervals, getIntervalHours]);

  // Salva agendamentos do usuário atual no Firestore
  const saveBookings = async (updatedBookings: Bookings) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'treinos', user.uid), { bookings: updatedBookings });
    } catch (error) {
      console.error('Erro ao salvar treinos:', error);
    }
  };

  // Adiciona agendamento para o usuário no dia e intervalo selecionados
  const addBooking = () => {
    if (!selectedDay || !startTime || !endTime || !user) return;

    const intervalHours = getIntervalHours(startTime, endTime);
    if (intervalHours.length === 0) {
      alert('Horário inválido: o horário de início deve ser antes do de término.');
      return;
    }

    const dayBookings = bookings[selectedDay] || [];

    // Verifica se o usuário já tem agendamento no mesmo horário
    for (const hour of intervalHours) {
      if (dayBookings.some(b => b.memberId === user.uid && b.time === hour)) {
        alert(`Você já marcou o horário ${hour} neste dia.`);
        return;
      }
    }

    const newEntries = intervalHours.map(hour => ({
      memberId: user.uid,
      time: hour,
    }));

    const updatedBookings: Bookings = {
      ...bookings,
      [selectedDay]: [...dayBookings, ...newEntries],
    };

    setBookings(updatedBookings);
    saveBookings(updatedBookings);
    setStartTime('');
    setEndTime('');
    setSelectedDay(null);
  };

  // Remove um agendamento específico do usuário
  const removeBooking = (day: string, time: string) => {
    if (!user) return;

    const dayBookings = bookings[day] || [];
    const updatedDayBookings = dayBookings.filter(
      b => !(b.memberId === user.uid && b.time === time)
    );

    const updatedBookings: Bookings = {
      ...bookings,
      [day]: updatedDayBookings,
    };

    setBookings(updatedBookings);
    saveBookings(updatedBookings);
  };

  // Remove todos os agendamentos do usuário para um dia específico
  const cancelAllBookingsForDay = (day: string) => {
    if (!user) return;

    const dayBookings = bookings[day] || [];
    const updatedDayBookings = dayBookings.filter(b => b.memberId !== user.uid);

    const updatedBookings: Bookings = {
      ...bookings,
      [day]: updatedDayBookings,
    };

    setBookings(updatedBookings);
    saveBookings(updatedBookings);
  };

  // Define cor do dia conforme quantidade/agendamentos
  const getDayColor = (day: string): string => {
    const dayBookings = bookings[day] || [];
    const count = dayBookings.length;

    if (count === 0) return '';
    if (count < 10) return 'red';

    const uniqueTimes = new Set(dayBookings.map(b => b.time));
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
        {daysOfWeek.map(day => {
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
                  if (start === end) {
                    return (
                      <div key={i} className={styles.timeSlot}>
                        Jogador {nick} - {start}{' '}
                        {memberId === user.uid && (
                          <button
                            className={styles.removeButton}
                            onClick={e => {
                              e.stopPropagation();
                              removeBooking(day, start);
                            }}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={i} className={styles.timeSlot}>
                        Jogador {nick} - {start} até {end}{' '}
                        {memberId === user.uid && (
                          <button
                            className={styles.removeButton}
                            onClick={e => {
                              e.stopPropagation();
                              const startIndex = HOURS.indexOf(start);
                              const endIndex = HOURS.indexOf(end);
                              if (startIndex === -1 || endIndex === -1) return;

                              for (let idx = startIndex; idx <= endIndex; idx++) {
                                removeBooking(day, HOURS[idx]);
                              }
                            }}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    );
                  }
                })
              )}
              {dayBookings.some(b => b.memberId === user.uid) && (
                <button
                  className={styles.cancelAllButton}
                  onClick={e => {
                    e.stopPropagation();
                    cancelAllBookingsForDay(day);
                  }}
                >
                  Cancelar todos meus treinos neste dia
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className={styles.form}>
          <h3>Marcar treino para {selectedDay}</h3>
          <label>
            Início:
            <select value={startTime} onChange={e => setStartTime(e.target.value)}>
              <option value="">Selecionar</option>
              {HOURS.map(hour => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fim:
            <select value={endTime} onChange={e => setEndTime(e.target.value)}>
              <option value="">Selecionar</option>
              {HOURS.map(hour => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </label>

          <button onClick={addBooking} disabled={!startTime || !endTime}>
            Marcar
          </button>
          <button onClick={() => setSelectedDay(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Treinos;