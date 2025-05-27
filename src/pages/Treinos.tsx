// Treinos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Treinos.module.css';
import relogioStyles from '../styles/components/Relogio.module.css'; // Novo ficheiro para estilos do relógio
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

    // Valores iniciais para os relógios
    // Mudar de NaN para valores numéricos válidos
    const [startTime12, setStartTime12] = useState<number>(12); // Ou 0, dependendo do que queres como default para 12 AM
    const [startTimeMinuto, setStartTimeMinuto] = useState<number>(0);
    const [startTimeAM, setStartTimeAM] = useState(true);

    const [endTime12, setEndTime12] = useState<number>(1); // 1 AM
    const [endTimeMinuto, setEndTimeMinuto] = useState<number>(0);
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
            // Captura o estado atual da hora/minuto do relógio que está a ser arrastado
            if (isSelectingStartTime) {
                setDragStartTimeHour12(startTime12);
                setDragStartTimeMinute(startTimeMinuto);
            } else if (isSelectingEndTime) {
                setDragStartTimeHour12(endTime12);
                setDragStartTimeMinute(endTimeMinuto);
            }
        } else if (type === 'minuto') {
            setIsDraggingMinute(true);
            setDragStartAngleMinute(angle);
            // Captura o estado atual da hora/minuto do relógio que está a ser arrastado
            if (isSelectingStartTime) {
                setDragStartTimeHour12(startTime12);
                setDragStartTimeMinute(startTimeMinuto);
            } else if (isSelectingEndTime) {
                setDragStartTimeHour12(endTime12);
                setDragStartTimeMinute(endTimeMinuto);
            }
        }
    }, [getAngle, startTime12, startTimeMinuto, endTime12, endTimeMinuto, isSelectingStartTime, isSelectingEndTime]);


    const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (isDraggingHour || isDraggingMinute) {
        const targetElement = event.target as Element;
        const svgElement = targetElement.closest('svg');

        if (!svgElement) {
            setIsDraggingHour(false);
            setIsDraggingMinute(false);
            return;
        }

        const rect = svgElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'clientX' in event ? event.clientX : (event as TouchEvent).touches[0].clientX;
        const clientY = 'clientY' in event ? event.clientY : (event as TouchEvent).touches[0].clientY;
        let currentAngle = getAngle(centerX, centerY, clientX, clientY);

        // Normalizar o ângulo para estar entre 0 e 2*PI, começando às 3 horas (direita)
        if (currentAngle < 0) {
            currentAngle += 2 * Math.PI;
        }

        if (isDraggingHour) {
            // Calcular a nova hora com base na diferença de ângulo
            const angleDiff = currentAngle - dragStartAngleHour;
            const degreeDiff = angleDiff * (180 / Math.PI);
            
            // Cada hora é 30 graus. A mudança na hora é a diferença de graus / 30.
            // Usamos Math.floor para capturar a mudança inteira e evitar saltos
            // ou arredondamentos inesperados que façam a hora "saltar" para trás.
            let hourChange = Math.floor(degreeDiff / 30); 

            let newHour12 = (dragStartTimeHour12 + hourChange);

            // Ajustar para o ciclo de 12 horas, garantindo que 12AM/PM são tratados como 12
            newHour12 = newHour12 % 12;
            if (newHour12 <= 0) newHour12 += 12; // Garante que 0 ou negativos se tornam 12 ou >0
            
            // Decidir se é AM ou PM. Esta parte é mais complexa e pode precisar de ajustes
            // dependendo de como queres gerir o ciclo de 24h e o AM/PM ao arrastar a hora.
            // Por enquanto, vamos manter o AM/PM que estava no momento do drag, ou adicionar uma lógica de toggling.
            // Para um simples relógio de 12 horas, o AM/PM não muda ao arrastar a hora no círculo.
            // Ele só mudaria se estivesses a arrastar por mais de 12 horas.
            // Para simplicidade, vamos manter o AM/PM como estava no início do arrasto.
            // Se quiseres que o AM/PM mude, terás de adicionar lógica para isso aqui.

            if (isSelectingStartTime) {
                setStartTime12(newHour12);
                // setStartTimeAM(newAMPMValue); // Se quiseres mudar AM/PM
            } else {
                setEndTime12(newHour12);
                // setEndTimeAM(newAMPMValue);
            }

        } else if (isDraggingMinute) {
            const angleDiff = currentAngle - dragStartAngleMinute;
            const degreeDiff = angleDiff * (180 / Math.PI);
            
            // Cada minuto é 6 graus.
            let minuteChange = Math.floor(degreeDiff / 6);

            let newMinute = (dragStartTimeMinute + minuteChange);

            // Calcular as voltas completas dos minutos
            let hourAdvance = 0;
            if (newMinute >= 60) {
                hourAdvance = Math.floor(newMinute / 60);
                newMinute = newMinute % 60;
            } else if (newMinute < 0) {
                hourAdvance = Math.floor(newMinute / 60); // Será negativo
                newMinute = newMinute % 60;
                if (newMinute < 0) newMinute += 60; // Normaliza para 0-59
            }

            // Arredondar para o múltiplo de 5 mais próximo
            newMinute = Math.round(newMinute / 5) * 5;
            if (newMinute >= 60) newMinute = 0; // Pode arredondar para 60

            if (isSelectingStartTime) {
                setStartTimeMinuto(newMinute);
                // Ajustar a hora quando os minutos dão uma volta completa
                if (hourAdvance !== 0) {
                    setStartTime12(prevHour => {
                        let updatedHour = prevHour + hourAdvance;
                        // Lidar com o ciclo de 12 horas
                        updatedHour = updatedHour % 12;
                        if (updatedHour === 0) updatedHour = 12; // 0 vira 12
                        // Aqui a lógica para mudar AM/PM se a hora passar 12/24.
                        // Esta é a parte que é mais complexa para o AM/PM.
                        // Se for um relógio simples de 12h, a hora só avança.
                        return updatedHour;
                    });
                    // Também ajustar o AM/PM se necessário
                    setStartTimeAM(prevAM => {
                        let currentTotalMinutes = (isSelectingStartTime ? startTime12 : endTime12) * 60 + (isSelectingStartTime ? startTimeMinuto : endTimeMinuto);
                        currentTotalMinutes += (hourAdvance * 60);

                        let newHour24 = Math.floor(currentTotalMinutes / 60);
                        let isAM = newHour24 < 12; // AM se < 12, PM se >= 12
                        // Se a hora atual está a mudar AM/PM
                        return isAM;
                    });
                }

            } else { // isSelectingEndTime
                setEndTimeMinuto(newMinute);
                if (hourAdvance !== 0) {
                    setEndTime12(prevHour => {
                        let updatedHour = prevHour + hourAdvance;
                        updatedHour = updatedHour % 12;
                        if (updatedHour === 0) updatedHour = 12;
                        return updatedHour;
                    });
                    setEndTimeAM(prevAM => {
                        let currentTotalMinutes = (isSelectingStartTime ? startTime12 : endTime12) * 60 + (isSelectingStartTime ? startTimeMinuto : endTimeMinuto);
                        currentTotalMinutes += (hourAdvance * 60);

                        let newHour24 = Math.floor(currentTotalMinutes / 60);
                        let isAM = newHour24 < 12;
                        return isAM;
                    });
                }
            }
        }
    }
}, [isDraggingHour, isDraggingMinute, dragStartAngleHour, dragStartAngleMinute, dragStartTimeHour12, dragStartTimeMinute, getAngle, isSelectingStartTime, isSelectingEndTime, startTime12, startTimeMinuto, endTime12, endTimeMinuto]);
// Adicionadas dependências startTime12, startTimeMinuto, endTime12, endTimeMinuto
// porque as closures dentro de setStartTime12/setEndTime12 podem não ver o valor mais recente
// se não forem incluídas, embora prevHour já ajude.

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
        // Se h12 ou m forem NaN, retorna uma string vazia ou um valor padrão (depende de como queres lidar com isso)
        if (isNaN(h12) || isNaN(m)) return ''; 

        let h24 = h12;
        if (ampm) { // AM
            if (h12 === 12) h24 = 0; // 12 AM é 00h
        } else { // PM
            if (h12 !== 12) h24 = h12 + 12; // 1-11 PM é +12h
        }
        return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }, []);


    const timeToNumber = useCallback((time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }, []);

    const getIntervalHours = useCallback((start: string, end: string) => {
        // Lida com start ou end vazios
        if (!start || !end) return [];

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

            let currentStart = sortedTimes[0].original;
            let currentEnd = sortedTimes[0].original;

            for (let i = 1; i < sortedTimes.length; i++) {
                const current = sortedTimes[i];
                const prev = sortedTimes[i - 1];

                // Verifica se a hora atual é imediatamente após a anterior (ex: 10:00 -> 11:00)
                // Usamos 60 minutos como um "passo" de hora
                if (current.num === prev.num + 60) {
                    currentEnd = current.original;
                } else {
                    // Intervalo quebrado, adiciona o anterior e começa um novo
                    intervals.push({ memberId, start: currentStart, end: currentEnd });
                    currentStart = current.original;
                    currentEnd = current.original;
                }
            }
            // Adiciona o último intervalo
            intervals.push({ memberId, start: currentStart, end: currentEnd });
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

                setBookings(allBookingsRaw);

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
    }, [db, user]);

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

        // Se os valores forem NaN (input vazio), trata como erro
        if (isNaN(startTime12) || isNaN(startTimeMinuto) || isNaN(endTime12) || isNaN(endTimeMinuto)) {
            alert("Por favor, preencha as horas de início e fim.");
            return;
        }

        const start = formatarHora24h(startTime12, startTimeMinuto, startTimeAM);
        const end = formatarHora24h(endTime12, endTimeMinuto, endTimeAM);

        if (timeToNumber(end) <= timeToNumber(start)) {
            alert("A hora de fim deve ser posterior à hora de início.");
            return;
        }

        const hoursToBook = getIntervalHours(start, end);
        let updatedBookings = { ...bookings };
        const dayBookings = updatedBookings[selectedDay] || [];

        let hasOverlap = false;
        for (const hour of hoursToBook) {
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
        for (const hour of hoursToBook) {
            newBookingsForDay.push({ memberId: user.uid, time: hour });
        }
        updatedBookings[selectedDay] = newBookingsForDay;

        setBookings(updatedBookings);
        saveBookings(updatedBookings); // Salva as marcações atualizadas no Firebase
        setIsSelectingEndTime(false);
        setSelectedDay(null); // Reseta a seleção após adicionar
    };

    const removeBooking = (day: string, time: string, memberId: string) => {
        if (!user || user.uid !== memberId) return; // Só pode remover as próprias marcações
        const dayBookings = bookings[day] || [];
        const updatedDayBookings = dayBookings.filter(b => !(b.memberId === memberId && b.time === time));
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
        const uniqueTimes = new Set(dayBookings.map(b => b.time));

        if (uniqueTimes.size === 0) return '';

        const myBookingsCount = dayBookings.filter(b => user && b.memberId === user.uid).length;

        if (myBookingsCount > 0) return 'green';

        if (uniqueTimes.size < 10) return 'red';
        
        return 'yellow';
    };

    const handleDayClick = (day: string) => {
        setSelectedDay(day);
        setIsSelectingStartTime(true);
        // Resetar as horas para o estado inicial para cada nova seleção
        setStartTime12(12); // Inicia em 12 (AM)
        setStartTimeMinuto(0);
        setStartTimeAM(true);
        setEndTime12(1); // Para que a hora de fim comece 1h depois da hora de início (12AM -> 1AM)
        setEndTimeMinuto(0);
        setEndTimeAM(true);
    };

    const handleStartTimeOk = () => {
        // Valida se as horas são números válidos antes de continuar
        if (isNaN(startTime12) || isNaN(startTimeMinuto)) {
            alert("Por favor, selecione uma hora de início válida.");
            return;
        }

        setIsSelectingStartTime(false);
        setIsSelectingEndTime(true);
        
        // Define a hora de início como base para a hora de fim, adicionando 1h
        let initialEndTime12 = startTime12;
        let initialEndTimeMinuto = startTimeMinuto;
        let initialEndTimeAM = startTimeAM;

        // Adiciona 1 hora ao initialEndTime12
        if (initialEndTime12 === 11 && initialEndTimeAM) { // 11 AM -> 12 PM
            initialEndTime12 = 12;
            initialEndTimeAM = false;
        } else if (initialEndTime12 === 11 && !initialEndTimeAM) { // 11 PM -> 12 AM (do dia seguinte)
            initialEndTime12 = 12;
            initialEndTimeAM = true;
        } else if (initialEndTime12 === 12 && initialEndTimeAM) { // 12 AM -> 1 AM
            initialEndTime12 = 1;
            initialEndTimeAM = true;
        } else if (initialEndTime12 === 12 && !initialEndTimeAM) { // 12 PM -> 1 PM
            initialEndTime12 = 1;
            initialEndTimeAM = false;
        }
        else { // Para outras horas (1 a 10), simplesmente incrementa
            initialEndTime12 += 1;
        }

        setEndTime12(initialEndTime12);
        setEndTimeMinuto(initialEndTimeMinuto);
        setEndTimeAM(initialEndTimeAM);
    };

    const handleEndTimeOk = () => {
        // Valida se as horas são números válidos antes de continuar
        if (isNaN(endTime12) || isNaN(endTimeMinuto)) {
            alert("Por favor, selecione uma hora de fim válida.");
            return;
        }
        addBookingInterval();
    };

    const resetSelection = () => {
        setSelectedDay(null);
        setIsSelectingStartTime(false);
        setIsSelectingEndTime(false);
        // Resetar para NaN para permitir inputs vazios
        setStartTime12(NaN);
        setStartTimeMinuto(NaN);
        setStartTimeAM(true);
        setEndTime12(NaN);
        setEndTimeMinuto(NaN);
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
                                    transform={`rotate(${isNaN(startTimeMinuto) ? 0 : startTimeMinuto * 6})`}
                                    onMouseDown={(e) => handlePointerDown(e, 'minuto')}
                                    onTouchStart={(e) => handlePointerDown(e, 'minuto')}
                                />
                                <line
                                    className={`${relogioStyles.ponteiro} ${relogioStyles.hora}`}
                                    x1="50" y1="50" x2="50" y2="35"
                                    transform={`rotate(${isNaN(startTime12) || isNaN(startTimeMinuto) ? 0 : (startTime12 % 12 + startTimeMinuto / 60) * 30})`}
                                />
                                {/* Área de clique/toque maior para o ponteiro da hora */}
                                <circle
                                    className={relogioStyles.ponteiroClickArea}
                                    cx="50" cy="50" r="25" /* Raio para a área de clique */
                                    transform={`rotate(${isNaN(startTime12) || isNaN(startTimeMinuto) ? 0 : (startTime12 % 12 + startTimeMinuto / 60) * 30})`} /* Rotação para a área de clique */
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
                                value={startTime12 === 0 ? 12 : startTime12} // Se 0, exibe 12 (para 12 AM/PM)
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        // Se estiver vazio, podes querer um comportamento específico, mas não NaN para o estado.
                                        // Talvez, voltar ao último valor válido, ou a um default (ex: 12)
                                        setStartTime12(12); 
                                    } else {
                                        let num = parseInt(val);
                                        if (isNaN(num)) num = 12; // Default se for inválido
                                        if (num < 1) num = 12; // Mínimo 1, mas 12AM/PM é especial
                                        if (num > 12) num = 1; // Máximo 12
                                        setStartTime12(num);
                                    }
                                }}
                                className={relogioStyles.digitalInput}
                            />

                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={String(startTimeMinuto).padStart(2, '0')} // Sempre formata para 2 dígitos
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setStartTimeMinuto(0); // Default para 0
                                    } else {
                                        let num = parseInt(val);
                                        if (isNaN(num)) num = 0;
                                        if (num < 0) num = 0;
                                        if (num > 59) num = 59;
                                        setStartTimeMinuto(num);
                                    }
                                }}
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
                                    transform={`rotate(${isNaN(endTimeMinuto) ? 0 : endTimeMinuto * 6})`}
                                    onMouseDown={(e) => handlePointerDown(e, 'minuto')}
                                    onTouchStart={(e) => handlePointerDown(e, 'minuto')}
                                />
                                <line
                                    className={`${relogioStyles.ponteiro} ${relogioStyles.hora}`}
                                    x1="50" y1="50" x2="50" y2="35"
                                    transform={`rotate(${isNaN(endTime12) || isNaN(endTimeMinuto) ? 0 : (endTime12 % 12 + endTimeMinuto / 60) * 30})`}
                                />
                                {/* Área de clique/toque maior para o ponteiro da hora */}
                                <circle
                                    className={relogioStyles.ponteiroClickArea}
                                    cx="50" cy="50" r="25" /* Raio para a área de clique */
                                    transform={`rotate(${isNaN(endTime12) || isNaN(endTimeMinuto) ? 0 : (endTime12 % 12 + endTimeMinuto / 60) * 30})`} /* Rotação para a área de clique */
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
                                value={isNaN(endTime12) ? '' : endTime12}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setEndTime12(NaN);
                                    } else {
                                        let num = parseInt(val);
                                        if (isNaN(num)) num = 1;
                                        if (num < 1) num = 1;
                                        if (num > 12) num = 12;
                                        setEndTime12(num);
                                    }
                                }}
                                className={relogioStyles.digitalInput}
                            />
                            :
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={isNaN(endTimeMinuto) ? '' : String(endTimeMinuto).padStart(2, '0')}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setEndTimeMinuto(NaN);
                                    } else {
                                        let num = parseInt(val);
                                        if (isNaN(num)) num = 0;
                                        if (num < 0) num = 0;
                                        if (num > 59) num = 59;
                                        setEndTimeMinuto(num);
                                    }
                                }}
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
                                                        const intervalHours = getIntervalHours(start, end);
                                                        for(const hourToRemove of intervalHours) {
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
                            {dayBookings.some(b => user && b.memberId === user.uid) && (
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