// Treinos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Treinos.module.css';
import relogioStyles from '../styles/Relogio.module.css'; // Novo ficheiro para estilos do relógio
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

type Booking = {
    memberId: string;
    time: string;
};

type DayBookings = Booking[];
type Bookings = Record<string, DayBookings>;
type Usernames = Record<string, string>;

const HOURS_24 = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' + i : i}:00`);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);

const Treinos: React.FC = () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    const [bookings, setBookings] = useState<Bookings>({});
    const [usernames, setUsernames] = useState<Usernames>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const [isSelectingStartTime, setIsSelectingStartTime] = useState(false);
    const [isSelectingEndTime, setIsSelectingEndTime] = useState(false);

    const [startTime12, setStartTime12] = useState(12);
    const [startTimeMinuto, setStartTimeMinuto] = useState(0);
    const [startTimeAM, setStartTimeAM] = useState(true);

    const [endTime12, setEndTime12] = useState(13); // Default para evitar hora de fim igual ao início
    const [endTimeMinuto, setEndTimeMinuto] = useState(0);
    const [endTimeAM, setEndTimeAM] = useState(true);

    const [isDraggingHour, setIsDraggingHour] = useState(false);
    const [isDraggingMinute, setIsDraggingMinute] = useState(false);
    const [dragStartAngleHour, setDragStartAngleHour] = useState(0);
    const [dragStartAngleMinute, setDragStartAngleMinute] = useState(0);
    const [dragStartTimeHour12, setDragStartTimeHour12] = useState(startTime12);
    const [dragStartTimeMinute, setDragStartTimeMinute] = useState(startTimeMinuto);

    const getAngle = useCallback((cx: number, cy: number, x: number, y: number) => {
        const dx = x - cx;
        const dy = y - cy;
        return Math.atan2(dy, dx);
    }, []);

    const handlePointerDown = useCallback((event: React.MouseEvent | React.TouchEvent, type: 'hora' | 'minuto') => {
        const svgElement = event.currentTarget.closest('svg');
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
        const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
        let angle = getAngle(centerX, centerY, clientX, clientY);

        // Normalizar o ângulo para estar entre 0 e 2*PI
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        if (type === 'hora') {
            setIsDraggingHour(true);
            setDragStartAngleHour(angle);
            setDragStartTimeHour12(startTime12);
            setDragStartTimeMinute(startTimeMinuto);
        } else if (type === 'minuto') {
            setIsDraggingMinute(true);
            setDragStartAngleMinute(angle);
            setDragStartTimeHour12(startTime12);
            setDragStartTimeMinute(startTimeMinuto);
        }
    }, [getAngle, startTime12, startTimeMinuto]);

    const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (isDraggingHour || isDraggingMinute) {
            const svgElement = (event.target as Element)?.closest('svg');
            if (!svgElement) return;
            const rect = svgElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const clientX = 'clientX' in event ? event.clientX : (event as TouchEvent).touches[0].clientX;
            const clientY = 'clientY' in event ? event.clientY : (event as TouchEvent).touches[0].clientY;
            const currentAngle = getAngle(centerX, centerY, clientX, clientY);

            if (isDraggingHour) {
                const angleDiff = currentAngle - dragStartAngleHour;
                const newHourAngle = (dragStartTimeHour12 % 12 + dragStartTimeMinute / 60) * 30 + angleDiff * (180 / Math.PI);
                // Arredondar para a hora mais próxima
                let newHour12 = Math.round(newHourAngle / 30);
                if (newHour12 <= 0) {
                    newHour12 = 12;
                } else if (newHour12 > 12) {
                    newHour12 %= 12;
                }
                setStartTime12(newHour12);
            } else if (isDraggingMinute) {
                const angleDiff = currentAngle - dragStartAngleMinute;
                const newMinuteAngle = dragStartTimeMinute * 6 + angleDiff * (180 / Math.PI);
                const newMinute = Math.round(newMinuteAngle / 6) % 60;
                setStartTimeMinuto(newMinute < 0 ? newMinute + 60 : newMinute);
            }
        }
    }, [isDraggingHour, isDraggingMinute, dragStartAngleHour, dragStartAngleMinute, dragStartTimeHour12, dragStartTimeMinute, getAngle]);

    const handlePointerUp = useCallback(() => {
        setIsDraggingHour(false);
        setIsDraggingMinute(false);
    }, []);

    useEffect(() => {
        if (isSelectingStartTime || isSelectingEndTime) {
            document.addEventListener('mousemove', handlePointerMove);
            document.addEventListener('mouseup', handlePointerUp);
            document.addEventListener('touchmove', handlePointerMove, { passive: false });
            document.addEventListener('touchend', handlePointerUp);
            document.addEventListener('touchcancel', handlePointerUp);
        } else {
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('mouseup', handlePointerUp);
            document.removeEventListener('touchmove', handlePointerMove);
            document.removeEventListener('touchend', handlePointerUp);
            document.removeEventListener('touchcancel', handlePointerUp);
        }

        return () => {
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('mouseup', handlePointerUp);
            document.removeEventListener('touchmove', handlePointerMove);
            document.removeEventListener('touchend', handlePointerUp);
            document.removeEventListener('touchcancel', handlePointerUp);
        };
    }, [isSelectingStartTime, isSelectingEndTime, handlePointerMove, handlePointerUp]);

    const formatarHora24h = useCallback((h12: number, m: number, ampm: boolean) => {
        let h24 = h12 === 12 ? (ampm ? 12 : 0) : (ampm ? h12 : h12 + 12);
        return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }, []);

    const timeToNumber = useCallback((time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }, []);

    const getIntervalHours = useCallback((start: string, end: string) => {
        const startIndex = HOURS_24.indexOf(start);
        const endIndex = HOURS_24.indexOf(end);
        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return [];
        return HOURS_24.slice(startIndex, endIndex);
    }, []);

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

    useEffect(() => {
        async function loadBookingsAndUsernames() {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
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
                const groupedBookings: Bookings = {};
                for (const day in allBookingsRaw) {
                    groupedBookings[day] = groupIntervals(allBookingsRaw[day]).flatMap(interval => {
                        const intervalHours = getIntervalHours(interval.start, interval.end);
                        return intervalHours.map(hour => ({ memberId: interval.memberId, time: hour }));
                    });
                }
                setBookings(groupedBookings);

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

    const saveBookings = async (updatedBookings: Bookings) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'treinos', user.uid), { bookings: updatedBookings });
        } catch (error) {
            console.error('Erro ao salvar treinos:', error);
        }
    };

    const addBookingInterval = () => {
        if (!selectedDay || !user) return;

        const start = formatarHora24h(startTime12, startTimeMinuto, startTimeAM);
        const end = formatarHora24h(endTime12, endTimeMinuto, endTimeAM);

        if (timeToNumber(end) <= timeToNumber(start)) {
            alert("A hora de fim deve ser posterior à hora de início.");
            return;
        }

        const hours = getIntervalHours(start, end);
        let updatedBookings = { ...bookings };
        const dayBookings = updatedBookings[selectedDay] || [];

        let hasOverlap = false;
        for (const hour of hours) {
            if (dayBookings.some(b => b.memberId === user.uid && b.time === hour)) {
                hasOverlap = true;
                break;
            }
        }

        if (hasOverlap) {
            alert("Já existem marcações suas dentro do intervalo selecionado.");
            return;
        }

        const newBookingsForDay = [...dayBookings];
        for (const hour of hours) {
            newBookingsForDay.push({ memberId: user.uid, time: hour });
        }
        updatedBookings[selectedDay] = newBookingsForDay;

        setBookings(updatedBookings);
        saveBookings(updatedBookings);
        setIsSelectingEndTime(false);
        setSelectedDay(null);
    };

    const removeBooking = (day: string, time: string) => {
        if (!user) return;
        const dayBookings = bookings[day] || [];
        const updatedDayBookings = dayBookings.filter(b => !(b.memberId === user.uid && b.time === time));
        const updatedBookings = { ...bookings, [day]: updatedDayBookings };
        setBookings(updatedBookings);
        saveBookings(updatedBookings);
    };

    const cancelAllBookingsForDay = (day: string) => {
        if (!user) return;
        const dayBookings = bookings[day] || [];
        const updatedDayBookings = dayBookings.filter(b => b.memberId !== user.uid);
        const updatedBookings = { ...bookings, [day]: updatedDayBookings };
        setBookings(updatedBookings);
        saveBookings(updatedBookings);
    };

    const getDayColor = (day: string): string => {
        const dayBookings = bookings[day] || [];
        const count = dayBookings.length;
        if (count === 0) return '';
        if (count < 10) return 'red';
        const uniqueTimes = new Set(dayBookings.map(b => b.time));
        if (uniqueTimes.size === 1) return 'green';
        return 'yellow';
    };

    const handleDayClick = (day: string) => {
        setSelectedDay(day);
        setIsSelectingStartTime(true);
    };

    const handleStartTimeOk = () => {
        setIsSelectingStartTime(false);
        setIsSelectingEndTime(true);
        // Manter a hora de início selecionada para o próximo relógio
    };

    const handleEndTimeOk = () => {
        addBookingInterval();
    };

    const resetSelection = () => {
        setSelectedDay(null);
        setIsSelectingStartTime(false);
        setIsSelectingEndTime(false);
        setStartTime12(12);
        setStartTimeMinuto(0);
        setStartTimeAM(true);
        setEndTime12(13);
        setEndTimeMinuto(0);
        setEndTimeAM(true);
    };

    if (!user) {
        return <p className={styles.warning}>Você precisa estar logado para ver e marcar treinos.</p>;
    }

    if (loading) {
        return <p className={styles.loading}>Carregando treinos...</p>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Marque seu treino</h2>
            <p className={styles.description}>
                Escolha o dia e os horários de início e fim para marcar seu treino.
            </p>

            {isSelectingStartTime && selectedDay && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Escolha o início do treino para {selectedDay}</h3>
                        <div className={relogioStyles.relogioContainer}>
                            <svg className={relogioStyles.relogioSvg} viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="50" fill="var(--secondary-background)" stroke="var(--box-shadow-color)" strokeWidth="1" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-color)" strokeWidth="2" />
                                {HOURS_12.map(hour => {
                                    const angle = (hour / 12) * 2 * Math.PI - Math.PI / 2;
                                    const x = 50 + 40 * Math.cos(angle);
                                    const y = 50 + 40 * Math.sin(angle);
                                    return (
                                        <text key={hour} x={x} y={y + 3} textAnchor="middle" fill="var(--primary-text)" className={relogioStyles.numeroRelogio}>
                                            {hour}
                                        </text>
                                    );
                                })}
                                <line
                                    className={`${relogioStyles.ponteiro} ${relogioStyles.minuto}`}
                                    x1="50" y1="50" x2="50" y2="25"
                                    style={{ transform: `rotate(${startTimeMinuto * 6}deg)` }}
                                    onMouseDown={(e) => handlePointerDown(e, 'minuto')}
                                    onTouchStart={(e) => handlePointerDown(e, 'minuto')}
                                />
                        <line
                            className={`${relogioStyles.ponteiro} ${relogioStyles.hora}`}
                            x1="50" y1="50" x2="50" y2="35"
                            style={{ transform: `rotate(${(startTime12 % 12 + startTimeMinuto / 60) * 30}deg)` }}
                            onMouseDown={(e) => handlePointerDown(e, 'hora')}
                            onTouchStart={(e) => handlePointerDown(e, 'hora')}
                        />
                                <circle className={relogioStyles.pinoCentral} cx="50" cy="50" r="3" />
                            </svg>
                        </div>
                        <div className={relogioStyles.relogioDigitalContainer}>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={startTime12}
                                onChange={e => setStartTime12(parseInt(e.target.value) || 12)}
                                className={relogioStyles.digitalInput}
                            />
                            :
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={String(startTimeMinuto).padStart(2, '0')}
                                onChange={e => setStartTimeMinuto(parseInt(e.target.value) || 0)}
                                className={relogioStyles.digitalInput}
                            />
                            <div className={relogioStyles.amPmContainer}>
                                <button
                                    type="button"
                                    className={startTimeAM ? relogioStyles.selected : ''}
                                    onClick={() => setStartTimeAM(true)}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    className={!startTimeAM ? relogioStyles.selected : ''}
                                    onClick={() => setStartTimeAM(false)}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                        <button onClick={handleStartTimeOk} className={styles.confirmButton}>OK</button>
                        <button onClick={resetSelection} className={styles.cancelButton}>Cancelar</button>
                    </div>
                </div>
            )}

            {isSelectingEndTime && selectedDay && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Escolha o fim do treino para {selectedDay}</h3>
                        <div className={relogioStyles.relogioContainer}>
                            <svg className={relogioStyles.relogioSvg} viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="50" fill="var(--secondary-background)" stroke="var(--box-shadow-color)" strokeWidth="1" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-color)" strokeWidth="2" />
                                {HOURS_12.map(hour => {
                                    const angle = (hour / 12) * 2 * Math.PI - Math.PI / 2;
                                    const x = 50 + 40 * Math.cos(angle);
                                    const y = 50 + 40 * Math.sin(angle);
                                    return (
                                        <text key={hour} x={x} y={y + 3} textAnchor="middle" fill="var(--primary-text)" className={relogioStyles.numeroRelogio}>
                                            {hour}
                                        </text>
                                    );
                                })}
                                <line
                                    className={`${relogioStyles.ponteiro} ${relogioStyles.minuto}`}
                                    x1="50" y1="50" x2="50" y2="25"
                                    style={{ transform: `rotate(${endTimeMinuto * 6}deg)` }}
                                    onMouseDown={(e) => handlePointerDown(e, 'minuto')}
                                    onTouchStart={(e) => handlePointerDown(e, 'minuto')}
                                />
                                <line
                                    className={`${relogioStyles.ponteiro} ${relogioStyles.hora}`}
                                    x1="50" y1="50" x2="50" y2="35"
                                    style={{ transform: `rotate(${(endTime12 % 12 + endTimeMinuto / 60) * 30}deg)` }}
                                    onMouseDown={(e) => handlePointerDown(e, 'hora')}
                                    onTouchStart={(e) => handlePointerDown(e, 'hora')}
                                />
                                <circle className={relogioStyles.pinoCentral} cx="50" cy="50" r="3" />
                            </svg>
                        </div>
                        <div className={relogioStyles.relogioDigitalContainer}>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={endTime12}
                                onChange={e => setEndTime12(parseInt(e.target.value) || 12)}
                                className={relogioStyles.digitalInput}
                            />
                            :
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={String(endTimeMinuto).padStart(2, '0')}
                                onChange={e => setEndTimeMinuto(parseInt(e.target.value) || 0)}
                                className={relogioStyles.digitalInput}
                            />
                            <div className={relogioStyles.amPmContainer}>
                                <button
                                    type="button"
                                    className={endTimeAM ? relogioStyles.selected : ''}
                                    onClick={() => setEndTimeAM(true)}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    className={!endTimeAM ? relogioStyles.selected : ''}
                                    onClick={() => setEndTimeAM(false)}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                        <button onClick={handleEndTimeOk} className={styles.confirmButton}>OK</button>
                        <button onClick={resetSelection} className={styles.cancelButton}>Cancelar</button>
                    </div>
                </div>
            )}

            <div className={styles.week}>
                {daysOfWeek.map(day => {
                    const dayColor = getDayColor(day);
                    const dayBookings = bookings[day] || [];

                    return (
                        <div
                            key={day}
                            className={`${styles.day} ${dayColor ? styles[dayColor] : ''}`}
                            onClick={() => handleDayClick(day)}
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
                                            Jogador {nick} - {start} {start !== end ? `até ${end}` : ''}
                                            {memberId === user?.uid && (
                                                <button
                                                    className={styles.removeButton}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (start === end) {
                                                            removeBooking(day, start);
                                                        } else {
                                                            const startIndex = HOURS_24.indexOf(start);
                                                            const endIndex = HOURS_24.indexOf(end);
                                                            if (startIndex !== -1 && endIndex !== -1) {
                                                                for (let idx = startIndex; idx < endIndex; idx++) {
                                                                    removeBooking(day, HOURS_24[idx]);
                                                                }
                                                                removeBooking(day, end); // Remover a hora final também
                                                            }
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
                            {dayBookings.some(b => b.memberId === user?.uid) && (
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
        </div>
    );
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default Treinos;