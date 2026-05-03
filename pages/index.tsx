import { useUser } from "../lib/useUser";
import Intro from "../components/intro";
import Layout from "../components/layout";
import Pages from "../components/pages";
import Signin from "../components/signin";
import Head from "next/head";
import React from "react";

const Index = () => {
  const { user } = useUser();

  if (!user) {
    return <Signin />;
  }

  return (
    <>
      <Layout>
        <Head>
          <title>NoteBook</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto px-4 main-container">
          <Intro />
          <Pages />
        </div>
      </Layout>
    </>
  );
};

export default Index;
