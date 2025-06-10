import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import type { News } from '../types/News';
import styles from '../styles/NewsDetail.module.css';

const NewsDetail: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!newsId) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      setLoading(true);
      const docRef = doc(db, 'news', newsId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const publicationDate = data.publicationDate?.toDate ? data.publicationDate.toDate() : new Date();
        
        setNews({
          id: docSnap.id,
          title: data.title || 'Título não encontrado',
          summary: data.summary || '',
          description: data.description || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
          publicationDate: publicationDate,
        });
      } else {
        setNews(null);
      }
      setLoading(false);
    };

    fetchNews();
  }, [newsId]);

  if (loading) {
    return <div className={styles.container}><p>A carregar notícia...</p></div>;
  }

  if (!news) {
    return (
        <div className={styles.container} style={{textAlign: 'center'}}>
            <h2>Oops! Página Não Encontrada</h2>
            <p>A notícia que você está a procurar não existe ou foi removida.</p>
            <Link to="/noticias" className={styles.backLink}>&larr; Voltar para todas as notícias</Link>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        {/* A imagem agora fica no topo do artigo para maior impacto */}
        <img src={news.imageUrl} alt={news.title} className={styles.image} />
        
        <div className={styles.articleContent}>
          <h1 className={styles.title}>{news.title}</h1>
          <span className={styles.date}>
            Publicado em: {new Date(news.publicationDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>

          {/* A descrição serve como um subtítulo ou introdução destacada */}
          {news.description && <p className={styles.description}>{news.description}</p>}
          
          <hr className={styles.separator} />
          
          {/* O conteúdo principal do artigo */}
          <div 
            className={styles.content} 
            dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br />') }} 
          />
          
          <hr className={styles.separator} />
          
          <Link to="/noticias" className={styles.backLink}>
            &larr; Voltar para todas as notícias
          </Link>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;