import Head from "next/head";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import Page from "../../types/page";
import { useUser } from "../../lib/useUser";
import Layout from "../../components/layout";
import PageForm from "../../components/page-form";
import Intro from "../../components/intro";
import { fetchPage, pagePath, pagesPath, updatePage } from "../../lib/api";
import Signin from "../../components/signin";
import { Container } from "semantic-ui-react";

const Edit = () => {
  const { user, ready } = useUser();
  const router = useRouter();
  const { id, book } = router.query;
  const { data, error } = useSWR<Page>(
    router.isReady && user ? pagePath(book as string, id as string) : null,
    fetchPage,
  );

  async function submit(name: string, content: string) {
    const updated = await updatePage(book as string, Number(id), name, content);
    await Promise.all([
      mutate(pagePath(book as string, id as string), updated, false),
      mutate(pagesPath(book as string)),
    ]);
    window?.sessionStorage.setItem("book", book as string);
  }

  if (!ready) {
    return null;
  }

  if (!user) {
    return <Signin />;
  }

  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
        </Head>
        <Container className="main-container">
          <Intro />
          <PageForm page={data} notebook={book as string} action={submit} />
        </Container>
      </Layout>
    </>
  );
};

export default Edit;
