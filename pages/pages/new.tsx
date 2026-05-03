import Head from "next/head";
import { useCollection } from "@nandorojo/swr-firestore";
import { useRouter } from "next/router";
import firebase from "firebase/app";
import { useUser } from "../../lib/useUser";
import Layout from "../../components/layout";
import Page from "../../types/page";
import PageForm from "../../components/page-form";
import Intro from "../../components/intro";
import Signin from "../../components/signin";

const New = () => {
  const { user } = useUser();
  const router = useRouter();
  const { book } = router.query;

  const page: Page = {
    id: "",
    userId: user?.id || "",
    noteBookId: book as string,
    name: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const collection = `notebooks-renew/${user?.id}/notebooks/${book}/pages`;
  const { add } = useCollection(collection);
  const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();

  if (!user) {
    return <Signin />;
  }

  async function submit(name: string, content: string) {
    await add({
      name: name,
      content: content,
      userId: user?.id,
      noteBookId: book as string,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });
    window?.sessionStorage.setItem("book", book as string);
  }

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
        </Head>
        <div className="container mx-auto px-4">
          <Intro />
          <PageForm page={page} action={submit} />
        </div>
      </Layout>
    </>
  );
};

export default New;
