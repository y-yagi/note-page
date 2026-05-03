import Head from "next/head";
import { useRouter } from "next/router";
import { useDocument } from "@nandorojo/swr-firestore";
import firebase from "firebase/app";
import Page from "../../types/page";
import { useUser } from "../../lib/useUser";
import Layout from "../../components/layout";
import PageForm from "../../components/page-form";
import Intro from "../../components/intro";
import Signin from "../../components/signin";

const Edit = () => {
  const { user } = useUser();
  const router = useRouter();
  const { id, book } = router.query;
  const collection = `notebooks-renew/${user?.id}/notebooks/${book}/pages/${id}`;
  const { data, update, error } = useDocument<Page>(collection);

  async function submit(name: string, content: string) {
    await update({
      name: name,
      content: content,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    window?.sessionStorage.setItem("book", book as string);
  }

  if (error) return <p>Error: {JSON.stringify(error)}</p>;
  if (!data) return <p>Loading...</p>;

  if (!user) {
    return <Signin />;
  }

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
        </Head>
        <div className="container mx-auto px-4 main-container">
          <Intro />
          <PageForm page={data} action={submit} />
        </div>
      </Layout>
    </>
  );
};

export default Edit;
