// src/pages/ItemsCatalog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Já está importado
import { getAllItemsFromJson } from '../services/itemsJsonService'; 
import ItemCard from '../components/ItemCard'; 
import type { Item } from '../types/Item'; 
import pageStyles from '../styles/ItemsCatalogPage.module.css'; 

const ItemsCatalog: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); 
  const navigate = useNavigate(); // <-- 'navigate' declarado aqui

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllItemsFromJson();
        setItems(data);
      } catch (err) {
        console.error("Erro ao buscar equipamentos:", err);
        setError("Não foi possível carregar os equipamentos. Verifique o arquivo JSON.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let currentItems = [...items];

    if (selectedCategory !== 'All') {
      currentItems = currentItems.filter(item =>
        item.category === selectedCategory
      );
    }

    currentItems.sort((a, b) => a.name.localeCompare(b.name));

    return currentItems;
  }, [items, selectedCategory]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    items.forEach(item => {
      categories.add(item.category);
    });
    return ['All', ...Array.from(categories).sort()]; 
  }, [items]);

  // CORRIGIDO: Use 'navigate' para ir para a página de detalhes do item
  const handleItemClick = (itemId: string) => {
    navigate(`/items/${itemId}`); // <-- Agora 'navigate' é usado aqui!
  };

  if (loading) {
    return <div className={pageStyles.loading}>Carregando equipamentos...</div>;
  }

  if (error) {
    return <div className={pageStyles.error}>{error}</div>;
  }

  return (
    <div className={pageStyles.container}>
      <h2 className={pageStyles.heading}>Catálogo de Equipamentos</h2>

      <div className={pageStyles.filtersContainer}>
        <label htmlFor="category-filter" className={pageStyles.filterLabel}>Filtrar por Categoria:</label>
        <select
          id="category-filter"
          className={pageStyles.filterSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className={pageStyles.grid}>
        {filteredAndSortedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={handleItemClick}
          />
        ))}
        {filteredAndSortedItems.length === 0 && !loading && !error && (
            <p className={pageStyles.noItems}>Nenhum equipamento encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
};

export default ItemsCatalog;