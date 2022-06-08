import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import classes from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadNextPage = async (): Promise<void> => {
    if (nextPage) {
      const response = await fetch(nextPage);
      const { results, next_page } = await response.json();

      setPosts([...posts, ...results]);
      setNextPage(next_page);
    }
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={classes.wrapper}>
        <Header />

        <main>
          <ul>
            {posts.map(post => (
              <li key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <small>
                      <p>
                        <FiCalendar size={20} />
                        {format(
                          new Date(post.first_publication_date),
                          'd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </p>
                      <p>
                        <FiUser size={20} />
                        {post.data.author}
                      </p>
                    </small>
                  </a>
                </Link>
              </li>
            ))}
          </ul>

          {nextPage && (
            <button type="button" onClick={handleLoadNextPage}>
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient({});
  const postsResponse: any = await prismic.getByType('post', {
    pageSize: 10,
  });

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60, // 1 minute
  };
};
