import Head from "next/head";
import { useRouter } from "next/router";
import { mutate } from "swr";
import { createPage, pagesPath } from "../../lib/api";
import { useUser } from "../../lib/useUser";
import Layout from "../../components/layout";
import Page from "../../types/page";
import PageForm from "../../components/page-form";
import Intro from "../../components/intro";
import Signin from "../../components/signin";
import { Container } from "semantic-ui-react";

const New = () => {
  const { user, ready } = useUser();
  const router = useRouter();
  const { book } = router.query;

  const page: Page = {
    id: 0,
    userId: user?.id || "",
    notebookId: 0,
    name: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!ready) {
    return null;
  }

  if (!user) {
    return <Signin />;
  }

  async function submit(name: string, content: string) {
    await createPage(book as string, name, content);
    await mutate(pagesPath(book as string));
    window?.sessionStorage.setItem("book", book as string);
  }

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
        </Head>
        <Container>
          <Intro />
          <PageForm page={page} notebook={book as string} action={submit} />
        </Container>
      </Layout>
    </>
  );
};

export default New;
