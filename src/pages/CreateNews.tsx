import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig';
// ===== CORREÇÃO 1: Importa a função com o nome correto 'addNews' =====
import { getUserProfile, addNews } from '../services/database';
import formStyles from '../styles/AuthForm.module.css';

const CreateNews: React.FC = () => {
  const [user, loadingUser] = useAuthState(auth);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proteção da página: só para coaches
  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      navigate('/login');
      return;
    }
    getUserProfile(user.uid).then(profile => {
      if (profile?.role !== 'coach') {
        navigate('/');
      }
    });
  }, [user, loadingUser, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title || !summary) {
      setError("Título, Resumo e Imagem de Destaque são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const newsData = { title, summary, description, content };
      // ===== CORREÇÃO 2: Chama a função com o nome correto 'addNews' =====
      await addNews(newsData, imageFile);
      setSuccess("Notícia publicada com sucesso!");
      setTimeout(() => navigate('/noticias'), 2000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={formStyles.container}>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <h2 className={formStyles.centeredHeading}>Publicar Nova Notícia</h2>
        <div className={formStyles.formGroup}>
          <label htmlFor="title">Título</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={formStyles.input} disabled={isSubmitting} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="summary">Resumo</label>
          <input type="text" id="summary" value={summary} onChange={e => setSummary(e.target.value)} required className={formStyles.input} disabled={isSubmitting} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="image">Imagem de Destaque</label>
          <input type="file" id="image" onChange={handleFileChange} required accept="image/*" className={formStyles.input} disabled={isSubmitting} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="description">Descrição</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className={formStyles.textarea} rows={3} disabled={isSubmitting}></textarea>
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="content">Conteúdo Completo</label>
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} className={formStyles.textarea} rows={10} disabled={isSubmitting}></textarea>
        </div>
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {success && <p className={formStyles.successMessage}>{success}</p>}
        <button type="submit" className={formStyles.button} disabled={isSubmitting}>
          {isSubmitting ? 'A Publicar...' : 'Publicar Notícia'}
        </button>
      </form>
    </div>
  );
};

export default CreateNews;