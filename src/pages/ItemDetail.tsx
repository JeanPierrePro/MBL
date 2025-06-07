// src/pages/ItemDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemByIdFromJson } from '../services/itemsJsonService'; // Importa o serviço correto para itens
import type { Item } from '../types/Item'; // Importa o tipo 'Item'
import detailStyles from '../styles/ItemDetailPage.module.css'; // Importa os estilos específicos para a página de detalhes de item

const ItemDetail: React.FC = () => {
  // 'itemId' é o parâmetro da URL (ex: /items/armadura-de-lamina)
  const { itemId } = useParams<{ itemId: string }>(); 
  const navigate = useNavigate(); // Usado para voltar para o catálogo
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      // Verifica se o ID do item foi fornecido na URL
      if (!itemId) {
        setError("ID do equipamento não fornecido na URL.");
        setLoading(false);
        return;
      }

      try {
        // Busca os dados do item usando o serviço
        const data = await getItemByIdFromJson(itemId);
        if (data) {
          setItem(data);
        } else {
          // Se o item não for encontrado no JSON
          setError(`Equipamento com ID "${itemId}" não encontrado no arquivo JSON.`);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do equipamento:", err);
        // Exibe uma mensagem de erro genérica para o usuário
        setError("Não foi possível carregar os detalhes do equipamento. Verifique o arquivo JSON ou o ID.");
      } finally {
        setLoading(false); // Finaliza o estado de carregamento
      }
    };

    fetchItemDetails();
  }, [itemId]); // O efeito é re-executado se o 'itemId' na URL mudar

  // Renderização condicional com base nos estados de carregamento e erro
  if (loading) {
    return <div className={detailStyles.loading}>Carregando detalhes do equipamento...</div>;
  }

  if (error) {
    return <div className={detailStyles.error}>{error}</div>;
  }

  if (!item) {
    return <div className={detailStyles.notFound}>Equipamento não encontrado.</div>;
  }

  // Se tudo estiver OK, exibe os detalhes do item
  return (
    <div className={detailStyles.container}>
      {/* Botão para voltar ao catálogo de equipamentos */}
      <button className={detailStyles.backButton} onClick={() => navigate('/items')}>
        &larr; Voltar para o Catálogo de Equipamentos
      </button>

      {/* Seção principal do cabeçalho com imagem e informações básicas */}
      <div className={detailStyles.header}>
        {/* Usa a URL da imagem do JSON. Um placeholder é uma boa prática caso a URL esteja vazia. */}
        <img src={item.imageUrl || "placeholder_item.png"} alt={item.name} className={detailStyles.itemImage} />
        <div className={detailStyles.info}>
          <h1 className={detailStyles.name}>{item.name}</h1>
          <p className={detailStyles.category}>**Categoria:** {item.category}</p>
          <p className={detailStyles.cost}>**Custo:** {item.cost} de Ouro</p>
          {/* Exibe se o item tem uma passiva única */}
          {item.passiveUnique && <p className={detailStyles.unique}>**Passiva Única**</p>}
        </div>
      </div>

      {/* Seção de Estatísticas */}
      <div className={detailStyles.section}>
        <h3>Estatísticas</h3>
        <ul className={detailStyles.statsList}>
          {/* Verifica se existem estatísticas e as mapeia */}
          {item.stats && Object.entries(item.stats).map(([key, value]) => (
            <li key={key}>
              {/* Formata o nome da chave (ex: physicalDefense -> Physical Defense) */}
              <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
            </li>
          ))}
          {!item.stats && <p>Nenhuma estatística principal.</p>}
        </ul>
      </div>

      {/* Seção de Efeito (se existir) */}
      {item.effect && (
        <div className={detailStyles.section}>
          <h3>Efeito: {item.effect.name}</h3>
          <p className={detailStyles.effectDescription}>{item.effect.description}</p>
        </div>
      )}

      {/* Seção de Itens que este item é construído a partir de (se existir) */}
      {item.builtFrom && item.builtFrom.length > 0 && (
        <div className={detailStyles.section}>
          <h3>Construído a partir de:</h3>
          <ul className={detailStyles.buildList}>
            {item.builtFrom.map((part, index) => (
              <li key={index}>{part}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Seção de Itens que este item constrói (se existir) */}
      {item.buildsInto && item.buildsInto.length > 0 && (
        <div className={detailStyles.section}>
          <h3>Constrói em:</h3>
          <ul className={detailStyles.buildList}>
            {item.buildsInto.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Seção de Lore (se existir) */}
      {item.lore && (
        <div className={detailStyles.section}>
          <h3>Lore</h3>
          <p className={detailStyles.loreText}>{item.lore}</p>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;