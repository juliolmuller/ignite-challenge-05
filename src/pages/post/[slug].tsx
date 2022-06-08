/* eslint-disable react/no-array-index-key */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import classes from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt?: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post?: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();
  const readingTime = useMemo(() => {
    if (!post) return 0;

    const wordsPerMinute = 200;
    const wordsCount = post.data.content.reduce((words, { heading, body }) => {
      const headingWords = heading.split(' ').length;
      const bodyWords = body.reduce((acc, { text }) => {
        return acc + text.split(' ').length;
      }, 0);

      return words + headingWords + bodyWords;
    }, 0);

    return Math.ceil(wordsCount / wordsPerMinute);
  }, [post]);

  return (
    <>
      <Head>
        <title>{post?.data.title} | spacetraveling</title>
      </Head>

      <div className={classes.wrapper}>
        <Header />

        {isFallback ? (
          <main className={classes.fallback}>Carregando...</main>
        ) : (
          <article>
            <img src={post.data.banner.url} alt={post.data.banner.alt} />

            <header>
              <h1>{post.data.title}</h1>
              <small>
                <p>
                  <FiCalendar size={20} />
                  {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </p>
                <p>
                  <FiUser size={20} />
                  {post.data.author}
                </p>
                <p>
                  <FiClock size={20} />
                  {readingTime} min
                </p>
              </small>
            </header>

            <main>
              {post.data.content.map(({ heading, body }, index) => (
                <Fragment key={index}>
                  <h2>{heading}</h2>
                  {body.map(({ text }, idx) => (
                    <p key={idx}>{text}</p>
                  ))}
                </Fragment>
              ))}
            </main>
          </article>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 10,
  });

  return {
    fallback: true,
    paths: postsResponse.results.map(({ uid }) => ({ params: { slug: uid } })),
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const postSlug = String(params?.slug);
  const prismic = getPrismicClient({});
  const post: any = await prismic.getByUID('post', postSlug);

  return {
    props: { post },
    revalidate: 60 * 60 * 2, // 2 hours
  };
};
