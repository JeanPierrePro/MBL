// src/pages/MapPage.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from '../styles/MapPage.module.css';

// Importa a imagem do mapa.
import sanctumMapImage from '../assets/Sanctum_Island_Map.jpg';

// --- Interfaces de Tipagem ---
interface Champion {
  id: string;
  name: string;
  imageUrl: string;
}

interface MapPoint {
  id: string;
  x: number;
  y: number;
  championId?: string;
  championImgUrl?: string;
}

interface DrawnPoint {
  x: number;
  y: number;
  color: string;
  size: number;
}

// --- Componente Principal MapPage ---
const MapPage: React.FC = () => {
  // Referências para elementos DOM
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados para funcionalidades existentes (pontos e campeões)
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  // Estados para carregar os dados dos campeões
  const [allChampions, setAllChampions] = useState<Champion[]>([]);
  const [loadingChampions, setLoadingChampions] = useState(true);
  const [errorChampions, setErrorChampions] = useState<string | null>(null);

  // Estados para a funcionalidade de desenho
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingModeEnabled, setIsDrawingModeEnabled] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<DrawnPoint[]>([]);
  const [drawingColor, setDrawingColor] = useState('red');
  const [drawingSize, setDrawingSize] = useState(5);

  // --- Estados para arrastar pontos ---
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  // O dragOffset vai armazenar a diferença entre o clique e o canto superior esquerdo do PONTO
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Flag para diferenciar clique de arrasto
  const didMoveWhileDragging = useRef(false);


  // --- Efeito para Carregar os Dados dos Campeões (fetch) ---
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoadingChampions(true);
        setErrorChampions(null);
        const response = await fetch('/champions_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Champion[] = await response.json();
        setAllChampions(data);
      } catch (error) {
        console.error("Erro ao carregar dados dos campeões:", error);
        setErrorChampions("Não foi possível carregar os dados dos campeões.");
      } finally {
        setLoadingChampions(false);
      }
    };
    fetchChampions();
  }, []);

  // --- Funções de Lógica da Aplicação ---

  // Filtra os campeões com base no termo de pesquisa
  const filteredChampions = useMemo(() => {
    if (!searchTerm) return [];
    return allChampions.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerm, allChampions]);

  // Lida com o clique no mapa para adicionar um ponto
  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Se o mouse se moveu para arrastar (seja desenho ou ponto) ou estamos no modo de desenho, não adicionamos um novo ponto.
    if (didMoveWhileDragging.current || isDrawingModeEnabled || !mapRef.current) {
      didMoveWhileDragging.current = false; // Resetamos a flag
      return;
    }

    const mapRect = mapRef.current.getBoundingClientRect();
    const clientX = event.clientX - mapRect.left;
    const clientY = event.clientY - mapRect.top;

    if (selectedChampion) {
      const newPoint: MapPoint = {
        id: `point-${Date.now()}`,
        // Ajustamos o X e Y para que o ponto seja CENTRALIZADO no clique
        // O tamanho do ponto é 40px, então 20px é metade (para o transform: translate(-50%, -50%))
        x: clientX, // - 20, // Removido ajuste aqui para o CSS lidar com isso
        y: clientY, // - 20, // Removido ajuste aqui para o CSS lidar com isso
        championId: selectedChampion.id,
        championImgUrl: selectedChampion.imageUrl,
      };
      setPoints((prevPoints) => [...prevPoints, newPoint]);
      setSelectedChampion(null);
      setSearchTerm('');
    }
  }, [selectedChampion, isDrawingModeEnabled]);


  // Função para remover um ponto do mapa
  const removePoint = useCallback((id: string) => {
    setPoints((prevPoints) => prevPoints.filter((point) => point.id !== id));
  }, []);

  // --- Funções para Arrastar Pontos ---

  // Inicia o arrasto de um ponto
  const handlePointMouseDown = useCallback((event: React.MouseEvent, pointId: string) => {
    event.stopPropagation(); // Impede que o clique no ponto se propague para o mapa
    setDraggingPointId(pointId);
    didMoveWhileDragging.current = false; // Resetamos a flag ao iniciar o clique no ponto

    const mapRect = mapRef.current?.getBoundingClientRect();
    const pointElement = event.currentTarget as HTMLDivElement; // Obtém a referência ao elemento div do ponto
    const pointRect = pointElement.getBoundingClientRect();

    if (mapRect) {
      // Calcula o offset do clique em relação ao canto superior esquerdo do MAPA
      // e depois subtrai a posição atual do ponto (canto superior esquerdo) no MAPA
      dragOffset.current = {
        x: (event.clientX - mapRect.left) - pointRect.left + mapRect.left,
        y: (event.clientY - mapRect.top) - pointRect.top + mapRect.top,
      };
      // Debug: console.log('Offset inicial:', dragOffset.current);
    }
  }, []); // Dependência 'points' removida pois não é necessária aqui, 'event.currentTarget' já dá o elemento

  // Atualiza a posição do ponto enquanto ele é arrastado
  const handlePointMouseMove = useCallback((event: MouseEvent) => {
    if (!draggingPointId || !mapRef.current) return;

    event.preventDefault(); // Impede seleção de texto no navegador
    didMoveWhileDragging.current = true; // Definimos a flag como TRUE se o mouse se moveu durante um arrasto

    const mapRect = mapRef.current.getBoundingClientRect();

    // Calcula a nova posição do canto superior esquerdo do ponto
    const newX = (event.clientX - mapRect.left) - (dragOffset.current.x - (mapRect.left));
    const newY = (event.clientY - mapRect.top) - (dragOffset.current.y - (mapRect.top));

    setPoints((prevPoints) =>
      prevPoints.map((point) =>
        point.id === draggingPointId ? { ...point, x: newX, y: newY } : point
      )
    );
    // Debug: console.log(`Arrastando ${draggingPointId}: X=${newX}, Y=${newY}`);
  }, [draggingPointId]);

  // Finaliza o arrasto de um ponto
  const handlePointMouseUp = useCallback(() => {
    setDraggingPointId(null);
    // didMoveWhileDragging é resetado no onClick do ponto, ou no handleMapClick, ou stopDrawing
  }, []);


  // --- Funções de Desenho ---

  // Inicia o desenho ao pressionar o mouse no canvas
  const startDrawing = useCallback((event: MouseEvent) => {
    if (!isDrawingModeEnabled || draggingPointId) return; // Só desenha se o modo de desenho estiver habilitado e não estiver arrastando um ponto
    setIsDrawing(true);
    didMoveWhileDragging.current = true; // Considere o início do desenho como um movimento
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDrawnPoints(prevPoints => [...prevPoints, { x, y, color: drawingColor, size: drawingSize }]);
  }, [isDrawingModeEnabled, drawingColor, drawingSize, draggingPointId]);

  // Continua o desenho enquanto o mouse se move e 'isDrawing' é true
  const draw = useCallback((event: MouseEvent) => {
    if (!isDrawing || !canvasRef.current || draggingPointId) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDrawnPoints(prevPoints => [...prevPoints, { x, y, color: drawingColor, size: drawingSize }]);
  }, [isDrawing, drawingColor, drawingSize, draggingPointId]);

  // Finaliza o desenho ao soltar o mouse ou sair do canvas
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    didMoveWhileDragging.current = false; // Reseta a flag quando o desenho para
  }, []);

  // --- Efeito para Renderizar o Desenho no Canvas ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mapRef.current) {
      const mapRect = mapRef.current.getBoundingClientRect();
      canvas.width = mapRect.width;
      canvas.height = mapRect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < drawnPoints.length; i++) {
      const p = drawnPoints[i];
      const prevP = drawnPoints[i - 1];

      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;

      if (prevP && p.color === prevP.color && p.size === prevP.size) {
        ctx.moveTo(prevP.x, prevP.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        // Para o primeiro ponto de um segmento ou se a cor/tamanho mudou
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y); // Desenha um ponto para um único clique
        ctx.stroke();
      }
    }
  }, [drawnPoints]);

  // --- Efeitos para Adicionar/Remover Listeners de Eventos Globais ---
  // Listener do Canvas para desenho
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      if (isDrawingModeEnabled) {
        canvasElement.addEventListener('mousedown', startDrawing);
        canvasElement.addEventListener('mousemove', draw);
        canvasElement.addEventListener('mouseup', stopDrawing);
        canvasElement.addEventListener('mouseleave', stopDrawing);
      }

      return () => {
        canvasElement.removeEventListener('mousedown', startDrawing);
        canvasElement.removeEventListener('mousemove', draw);
        canvasElement.removeEventListener('mouseup', stopDrawing);
        canvasElement.removeEventListener('mouseleave', stopDrawing);
      };
    }
  }, [startDrawing, draw, stopDrawing, isDrawingModeEnabled]);

  // Listeners globais para arrastar pontos (no window)
  useEffect(() => {
    window.addEventListener('mousemove', handlePointMouseMove);
    window.addEventListener('mouseup', handlePointMouseUp);

    // Listener global para resetar didMoveWhileDragging no mouseup em qualquer lugar
    window.addEventListener('mouseup', () => {
      didMoveWhileDragging.current = false;
    });

    return () => {
      window.removeEventListener('mousemove', handlePointMouseMove);
      window.removeEventListener('mouseup', handlePointMouseUp);
      window.removeEventListener('mouseup', () => {
        didMoveWhileDragging.current = false;
      });
    };
  }, [handlePointMouseMove, handlePointMouseUp]);


  // --- Renderização do Componente ---
  return (
    <div className={styles.mapPage}>
      <h2 className={styles.heading}>Sanctum Island - Quadro Estratégico</h2>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Pesquisar campeão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && filteredChampions.length > 0 && (
            <ul className={styles.searchResults}>
              {filteredChampions.map((champion) => (
                <li
                  key={champion.id}
                  onClick={() => {
                    setSelectedChampion(champion);
                    setSearchTerm('');
                  }}
                  className={styles.searchResultItem}
                >
                  <img src={champion.imageUrl} alt={champion.name} className={styles.championSearchImg} />
                  {champion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedChampion && (
          <div className={styles.selectedChampionIndicator}>
            <p>Campeão selecionado para marcar:</p>
            <img src={selectedChampion.imageUrl} alt={selectedChampion.name} className={styles.selectedChampionImg} />
            <span>{selectedChampion.name}</span>
            <button onClick={() => setSelectedChampion(null)} className={styles.clearSelectionButton}>X</button>
          </div>
        )}
        <p className={styles.instructions}>
          {loadingChampions && "Carregando campeões..."}
          {errorChampions && <span style={{ color: 'red' }}>{errorChampions}</span>}
          {!loadingChampions && !errorChampions && (allChampions.length === 0 ? "Nenhum campeão encontrado. Verifique o arquivo JSON." : (selectedChampion
            ? `**Clique no mapa para marcar a posição de ${selectedChampion.name}.**`
            : 'Pesquise um campeão e clique no mapa para marcá-lo.'))}
          <br />
          **Pressione e arraste um campeão para movê-lo.**
        </p>

        {/* NOVO: Opção para Habilitar/Desabilitar Desenho */}
        <div className={styles.drawingOptions}>
          <input
            type="checkbox"
            id="enableDrawing"
            checked={isDrawingModeEnabled}
            onChange={(e) => setIsDrawingModeEnabled(e.target.checked)}
          />
          <label htmlFor="enableDrawing">Habilitar Desenho</label>

          {isDrawingModeEnabled && ( // Mostra as opções de desenho apenas se habilitado
            <>
              <label htmlFor="drawingColor">Cor:</label>
              <input
                type="color"
                id="drawingColor"
                value={drawingColor}
                onChange={(e) => setDrawingColor(e.target.value)}
              />
              <label htmlFor="drawingSize">Tamanho:</label>
              <input
                type="range"
                id="drawingSize"
                min="1"
                max="20"
                value={drawingSize}
                onChange={(e) => setDrawingSize(Number(e.target.value))}
              />
              <span>{drawingSize}px</span>
            </>
          )}
        </div>
        {isDrawingModeEnabled && (
          <button onClick={() => setDrawnPoints([])} className={styles.clearDrawingButton}>Limpar Desenho</button>
        )}
      </div>

      <div
        ref={mapRef}
        className={styles.mapContainer}
        onClick={handleMapClick}
      >
        <img
          src={sanctumMapImage}
          alt="Mapa da Ilha Sanctum"
          className={styles.mapImage}
        />
        <canvas
          ref={canvasRef}
          className={styles.drawingCanvas}
          // O cursor do canvas só muda para crosshair se o modo de desenho estiver habilitado
          style={{ cursor: isDrawingModeEnabled ? 'crosshair' : 'default' }}
        />

        {points.map((point) => (
          <div
            key={point.id}
            className={styles.mapPoint}
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              transform: 'translate(-50%, -50%)', // Mantém o ponto centralizado na coordenada
              cursor: draggingPointId === point.id ? 'grabbing' : 'grab',
              zIndex: draggingPointId === point.id ? 4 : 3,
            }}
            // --- Eventos para arrastar o ponto ---
            onMouseDown={(e) => handlePointMouseDown(e, point.id)}
            // O onMouseUp aqui serve apenas para parar o arrasto, não para remover
            onMouseUp={handlePointMouseUp}
            // --- Evento para remover (clique simples sem arrastar) ---
            onClick={(e) => {
              e.stopPropagation(); // Impede que o clique no ponto vá para o mapa
              // Remove o ponto apenas se NENHUM movimento de arrasto ocorreu.
              if (!didMoveWhileDragging.current) {
                removePoint(point.id);
              }
              // Sempre resetar a flag depois de processar o clique no ponto
              didMoveWhileDragging.current = false;
            }}
            title={point.championId ? `Remover ${allChampions.find(c => c.id === point.championId)?.name}` : 'Remover Ponto'}
          >
            {point.championImgUrl ? (
              <img src={point.championImgUrl} alt={point.championId} className={styles.championIcon} />
            ) : (
              <div className={styles.defaultPoint}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;