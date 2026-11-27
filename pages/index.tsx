import { useUser } from "../lib/useUser";
import Intro from "../components/intro";
import Layout from "../components/layout";
import Pages from "../components/pages";
import Signin from "../components/signin";
import Head from "next/head";
import React from "react";
import { Container } from "semantic-ui-react";

const Index = () => {
  const { user, ready } = useUser();

  if (!ready) {
    return null;
  }

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
        <Container className="main-container">
          <Intro />
          <Pages />
        </Container>
      </Layout>
    </>
  );
};

export default Index;
