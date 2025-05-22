// src/pages/CreateNews.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addNews, getUserProfile } from '../services/database';
import type { News } from '../types/News';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig';
import formStyles from '../styles/AuthForm.module.css';
import type { UserProfile } from '../types/User'; // Importar UserProfile

const CreateNews: React.FC = () => {
  const [user, loadingUser] = useAuthState(auth);
  // Renomeado para 'canCreateNews' para refletir a permissão de coach
  const [canCreateNews, setCanCreateNews] = useState(false);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userProfile: UserProfile | null = await getUserProfile(user.uid);
        // VERIFICA SE O USUÁRIO É 'coach'
        if (!(userProfile && userProfile.role === 'coach')) {
          alert('Acesso negado. Apenas treinadores podem criar notícias.');
          navigate('/noticias'); // Redireciona para notícias se não for coach
        } else {
          setCanCreateNews(true); // Permite a criação se for coach
        }
      } else {
        alert('Você precisa estar logado para acessar esta página.');
        navigate('/login'); // Redireciona para o login se não estiver logado
      }
    };

    if (!loadingUser) {
      checkUserRole();
    }
  }, [user, loadingUser, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canCreateNews) { // Verifica a permissão antes de tentar adicionar
      alert('Você não tem permissão para adicionar notícias.');
      return;
    }

    if (!title || !description || !imageUrl) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newNewsData: Omit<News, 'id' | 'publicationDate'> = {
      title,
      description,
      imageUrl,
      // Adicione a data de publicação, pois News type agora espera (ou ajuste o tipo)
      // Se News espera 'publicationDate', você precisa adicionar um valor aqui.
      // Por exemplo, usando a data atual:
      // publicationDate: new Date().toISOString(), // ou new Date() se seu Firebase aceitar timestamp
    };

    try {
      const newsId = await addNews(newNewsData);
      if (newsId) {
        alert('Notícia/Evento adicionado com sucesso!');
        navigate('/noticias');
      } else {
        alert('Falha ao adicionar notícia/evento. Verifique o console.');
      }
    } catch (error) {
      console.error('Erro ao adicionar notícia/evento:', error);
      alert('Ocorreu um erro ao adicionar a notícia/evento.');
    }
  };

  if (loadingUser) {
    return <p>Verificando permissões de acesso...</p>;
  }

  // Se o usuário não tem permissão após a verificação, exibe mensagem e impede o formulário de ser mostrado.
  if (!canCreateNews) {
    return <p>Acesso negado. Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className={formStyles.container}>
      <h2>Adicionar Nova Notícia / Evento</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.formGroup}>
          <label htmlFor="title" className={formStyles.label}>Título:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="description" className={formStyles.label}>Descrição:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className={formStyles.textarea}
          ></textarea>
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="imageUrl" className={formStyles.label}>URL da Imagem:</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>
        <button type="submit" className={formStyles.button}>Publicar Notícia / Evento</button>
      </form>
    </div>
  );
};

export default CreateNews;