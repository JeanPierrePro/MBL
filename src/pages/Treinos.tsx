import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Treinos.module.css';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';

// Tipagens para garantir a consistência dos dados
type Booking = {
  memberId: string;
  time: string; // Formato "HH:00"
  memberName?: string; // Adicionamos o nome do membro aqui! (Opcional para compatibilidade)
};

type DayBookings = Booking[];
type Bookings = Record<string, DayBookings>; // Mapeia o nome do dia para um array de agendamentos
type Usernames = Record<string, string>; // Mapeia o UID do usuário para o nickname

// Constantes para os horários e dias da semana
const HOURS = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' + i : i}:00`);
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Treinos: React.FC = () => {
  const auth = getAuth();
  const db = getFirestore();

  // Estados do componente
  const [bookings, setBookings] = useState<Bookings>({}); // Todos os agendamentos por dia
  const [usernames, setUsernames] = useState<Usernames>({}); // Nicknames de TODOS os usuários (para agendamentos antigos)
  const [currentUserNick, setCurrentUserNick] = useState<string | null>(null); // Nick do usuário LOGADO
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // Dia selecionado para agendar
  const [startTime, setStartTime] = useState(''); // Hora de início do novo agendamento
  const [endTime, setEndTime] = useState(''); // Hora de término do novo agendamento
  const [loading, setLoading] = useState(true); // Estado de carregamento

  const user = auth.currentUser; // Usuário atualmente logado

  // Função utilitária para converter hora "HH:mm" para minutos totais
  const timeToNumber = useCallback((time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }, []);

  // Retorna um array de strings de horas que compõem um intervalo
  const getIntervalHours = useCallback((start: string, end: string): string[] => {
    const startIndex = HOURS.indexOf(start);
    const endIndex = HOURS.indexOf(end); // endIndex é o *início* do último bloco + 1

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      return [];
    }

    // Retorna todos os horários entre startIndex e endIndex (excluindo endIndex)
    return HOURS.slice(startIndex, endIndex);
  }, []);

  // Agrupa agendamentos individuais do mesmo usuário em blocos contínuos para exibição
  const groupIntervals = useCallback((dayBookings: Booking[]) => {
    const byPlayer: Record<string, Booking[]> = {}; // Mapeia memberId para array de objetos Booking

    dayBookings.forEach(booking => {
      if (!byPlayer[booking.memberId]) byPlayer[booking.memberId] = [];
      byPlayer[booking.memberId].push(booking);
    });

    const intervals: { memberId: string; start: string; end: string; memberName?: string }[] = [];

    for (const memberId in byPlayer) {
      const sortedBookings = byPlayer[memberId]
        .map(b => ({ original: b.time, num: timeToNumber(b.time), memberName: b.memberName }))
        .sort((a, b) => a.num - b.num);

      if (sortedBookings.length === 0) continue;

      let currentStart = sortedBookings[0].original;
      let currentEnd = sortedBookings[0].original; // O último horário *incluído* no intervalo
      let currentMemberName = sortedBookings[0].memberName; // Nome para o intervalo

      for (let i = 1; i < sortedBookings.length; i++) {
        const current = sortedBookings[i];
        const prev = sortedBookings[i - 1];

        if (current.num === timeToNumber(prev.original) + 60) {
          currentEnd = current.original; // Estende o intervalo
        } else {
          // O intervalo foi quebrado, adiciona o intervalo anterior
          const displayEndIndex = HOURS.indexOf(currentEnd) + 1;
          const displayEnd = displayEndIndex < HOURS.length ? HOURS[displayEndIndex] : HOURS[HOURS.length - 1];
          intervals.push({ memberId, start: currentStart, end: displayEnd, memberName: currentMemberName });

          // Inicia um novo intervalo
          currentStart = current.original;
          currentEnd = current.original;
          currentMemberName = current.memberName;
        }
      }
      // Adiciona o último intervalo após o loop
      const displayEndIndex = HOURS.indexOf(currentEnd) + 1;
      const displayEnd = displayEndIndex < HOURS.length ? HOURS[displayEndIndex] : HOURS[HOURS.length - 1];
      intervals.push({ memberId, start: currentStart, end: displayEnd, memberName: currentMemberName });
    }
    return intervals;
  }, [timeToNumber]);

  // Efeito para carregar os agendamentos e nomes de usuário do Firestore na montagem
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Carrega agendamentos da coleção 'treinos'
        const treinosSnapshot = await getDocs(collection(db, 'treinos'));
        const allBookings: Bookings = {};
        const uniqueMemberIds = new Set<string>(); // Para coletar todos os memberIds presentes nos bookings

        treinosSnapshot.forEach(docSnap => {
          const day = docSnap.id;
          const data = docSnap.data();
          if (data && Array.isArray(data.bookings)) {
            const dayBookings = data.bookings as DayBookings;
            allBookings[day] = dayBookings;
            // Coleta os memberIds para buscar os usernames depois
            dayBookings.forEach(booking => uniqueMemberIds.add(booking.memberId));
          }
        });
        setBookings(allBookings);

        // 2. Carrega o nickname do usuário logado (se houver)
        let loggedInUserNick: string | null = null;
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
        if (currentUserDoc.exists()) {
          loggedInUserNick = currentUserDoc.data().nick || null;
        }
        setCurrentUserNick(loggedInUserNick);

        // 3. Carrega nicknames de TODOS os usuários presentes nos agendamentos (para compatibilidade/futuro)
        // Isso é mais eficiente do que buscar todos os 'users' se você tiver muitos.
        const usersMap: Usernames = {};
        if (uniqueMemberIds.size > 0) {
            const userDocsPromises = Array.from(uniqueMemberIds).map(uid => getDoc(doc(db, 'users', uid)));
            const userDocs = await Promise.all(userDocsPromises);
            userDocs.forEach(docSnap => {
                if (docSnap.exists() && docSnap.id) {
                    usersMap[docSnap.id] = docSnap.data().nick || docSnap.id.slice(0, 6);
                }
            });
        }
        setUsernames(usersMap);

      } catch (error) {
        console.error('Erro ao carregar treinos ou usuários:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [db, user]); // Dependências: db (Firestore) e user (usuário logado)

  // Salva os agendamentos de um dia específico no Firestore
  // Agora, saveDayBookings está envolvida em useCallback e é uma função estável.
  const saveDayBookings = useCallback(async (day: string, dayBookings: DayBookings) => {
    try {
      console.log(`[Firestore] Salvando para Firestore: Dia=${day}, Bookings:`, dayBookings);
      await setDoc(doc(db, 'treinos', day), { bookings: dayBookings });
      console.log(`[Firestore] Dados para o dia ${day} salvos com sucesso no Firestore.`);
    } catch (error) {
      console.error(`[Firestore] Erro ao salvar treinos para ${day} no Firestore:`, error);
    }
  }, [db]); // <-- 'db' é a única dependência aqui, pois a função a utiliza.

  // Adiciona um novo agendamento
  const addBooking = () => {
    if (!selectedDay || !startTime || !endTime || !user || currentUserNick === null) {
      alert('Por favor, selecione um dia, horário de início e término e certifique-se de estar logado com um nickname.');
      return;
    }

    const intervalHours = getIntervalHours(startTime, endTime);
    if (intervalHours.length === 0) {
      alert('Horário inválido: o horário de início deve ser antes do de término e ambos válidos.');
      return;
    }

    const currentDayBookings = bookings[selectedDay] || [];

    // Validação: Checa se qualquer hora do intervalo já está ocupada
    for (const hour of intervalHours) {
      if (currentDayBookings.some(b => b.time === hour)) {
        alert(`O horário ${hour} em ${selectedDay} já está ocupado.`);
        return;
      }
    }

    // Cria novas entradas de agendamento para cada hora no intervalo
    const newEntries: Booking[] = intervalHours.map(hour => ({
      memberId: user.uid,
      time: hour,
      memberName: currentUserNick, // Salva o nome do usuário diretamente no agendamento!
    }));

    // Atualiza o estado local com os novos agendamentos
    const updatedDayBookings = [...currentDayBookings, ...newEntries];
    setBookings(prevBookings => ({
      ...prevBookings,
      [selectedDay]: updatedDayBookings,
    }));

    // Persiste as mudanças no Firestore
    // saveDayBookings agora é uma função estável, então não causa re-renderizações desnecessárias
    saveDayBookings(selectedDay, updatedDayBookings);

    // Reseta o formulário
    setStartTime('');
    setEndTime('');
    setSelectedDay(null);
  };

  // Remove um agendamento individual
  const removeBooking = useCallback((day: string, timeToRemove: string, memberIdToRemove: string) => {
    console.log(`[REMOVE] Chamado: Dia=${day}, Hora=${timeToRemove}, Membro=${memberIdToRemove}`);

    if (!user || user.uid !== memberIdToRemove) {
      console.warn('[REMOVE] Bloqueado: Usuário não logado ou tentando desmarcar treino de outro membro.');
      alert('Você só pode desmarcar seus próprios treinos.');
      return;
    }

    const dayBookings = bookings[day] || [];
    console.log('[REMOVE] Bookings do dia ANTES do filtro:', dayBookings);

    const updatedDayBookings = dayBookings.filter(
      b => !(b.memberId === memberIdToRemove && b.time === timeToRemove)
    );
    console.log('[REMOVE] Bookings do dia DEPOIS do filtro (filtrados):', updatedDayBookings);

    if (updatedDayBookings.length === dayBookings.length) {
      console.warn(`[REMOVE] Aviso: Nenhum agendamento encontrado para remover com Time=${timeToRemove}, MemberId=${memberIdToRemove}. Verifique a consistência dos dados.`);
      return;
    }

    setBookings(prevBookings => ({
      ...prevBookings,
      [day]: updatedDayBookings,
    }));
    console.log('[REMOVE] Estado local atualizado.');

    saveDayBookings(day, updatedDayBookings)
      .then(() => console.log(`[REMOVE] Sucesso: Agendamento ${timeToRemove} de ${memberIdToRemove} removido e salvo no Firestore para ${day}.`))
      .catch(error => console.error(`[REMOVE] Erro ao salvar remoção no Firestore:`, error));
  }, [user, bookings, saveDayBookings]); // saveDayBookings agora é estável aqui!

  // Remove TODOS os agendamentos do usuário logado para um dia específico
  const cancelAllBookingsForDay = useCallback((day: string) => {
    console.log(`[CANCEL ALL] Chamado: Tentando cancelar TODOS os agendamentos do usuário para o dia: ${day}`);
    if (!user) {
      console.warn('[CANCEL ALL] Bloqueado: Usuário não logado ao tentar cancelar todos os agendamentos.');
      return;
    }

    const dayBookings = bookings[day] || [];
    console.log('[CANCEL ALL] Bookings do dia ANTES do filtro:', dayBookings);

    const updatedDayBookings = dayBookings.filter(b => b.memberId !== user.uid);
    console.log('[CANCEL ALL] Bookings do dia DEPOIS do filtro:', updatedDayBookings);

    if (updatedDayBookings.length === dayBookings.length) {
        console.warn(`[CANCEL ALL] Aviso: Nenhum agendamento do usuário atual encontrado para remover no dia ${day}.`);
        return;
    }

    setBookings(prevBookings => ({
      ...prevBookings,
      [day]: updatedDayBookings,
    }));
    console.log('[CANCEL ALL] Estado local atualizado.');

    saveDayBookings(day, updatedDayBookings)
      .then(() => console.log(`[CANCEL ALL] Sucesso: Todos os agendamentos do usuário para ${day} removidos e salvos no Firestore.`))
      .catch(error => console.error(`[CANCEL ALL] Erro ao salvar cancelamento de todos no Firestore:`, error));
  }, [user, bookings, saveDayBookings]); // saveDayBookings agora é estável aqui!

  // Determina a cor de fundo do dia com base na quantidade de agendamentos
  const getDayColor = (day: string): string => {
    const dayBookings = bookings[day] || [];
    const count = dayBookings.length;

    if (count === 0) return '';
    
    const uniqueTimesCount = new Set(dayBookings.map(b => b.time)).size;
    const occupancyPercentage = (uniqueTimesCount / HOURS.length) * 100;

    if (occupancyPercentage >= 75) return 'green';
    if (occupancyPercentage >= 30) return 'yellow';

    return 'red';
  };

  // Renderiza uma mensagem se o usuário não estiver logado
  if (!user) {
    return <p className={styles.warning}>Você precisa estar logado para ver e marcar treinos.</p>;
  }

  // Renderiza uma mensagem de carregamento
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
                groupIntervals(dayBookings).map(({ memberId, start, end, memberName }) => {
                  // Prioriza memberName salvo no booking, senão usa o mapa de usernames
                  const displayNick = memberName || usernames[memberId] || memberId.slice(0, 6);
                  const isCurrentUserBooking = memberId === user.uid;

                  return (
                    <div key={`${day}-${memberId}-${start}-${end}`} className={styles.timeSlot}>
                      {displayNick} - {start} até {end}{' '}
                      {isCurrentUserBooking && (
                        <button
                          className={styles.removeButton}
                          onClick={e => {
                            e.stopPropagation();

                            const startIndex = HOURS.indexOf(start);
                            const endIndex = HOURS.indexOf(end);

                            if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
                                console.warn(`[CLICK] Erro de índice ao tentar remover intervalo: start=${start}, end=${end}`);
                                return;
                            }

                            for (let i = startIndex; i < endIndex; i++) {
                                const hourToRemove = HOURS[i];
                                removeBooking(day, hourToRemove, memberId);
                            }
                          }}
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  );
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

          <button className={styles.confirmButton} onClick={addBooking} disabled={!startTime || !endTime}>
            Marcar
          </button>
          <button className={styles.cancelButton} onClick={() => setSelectedDay(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Treinos;