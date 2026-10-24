import Head from "next/head";
import { useUser } from "../../lib/useUser";
import Layout from "../../components/layout";
import Notebook from "../../types/notebook";
import NotebookForm from "../../components/notebook-form";
import Signin from "../../components/signin";
import Intro from "../../components/intro";
import { Container } from "semantic-ui-react";
import { mutate } from "swr";
import { createNotebook, notebooksPath } from "../../lib/api";

const New = () => {
  const { user } = useUser();

  const notebook: Notebook = {
    id: 0,
    userId: user?.id || "",
    name: "",
    createdAt: null,
    updatedAt: null,
  };

  if (!user) {
    return <Signin />;
  }

  async function submit(name: string) {
    await createNotebook(name);
    await mutate(notebooksPath);
  }

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
        </Head>
        <Container>
          <Intro />
          <NotebookForm notebook={notebook} action={submit} />
        </Container>
      </Layout>
    </>
  );
};

export default New;
