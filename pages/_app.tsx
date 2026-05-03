import { AppProps } from "next/app";
import "../styles/index.css";
import React from "react";
import { useEffect } from "react";
import "firebase/firestore";
import "firebase/auth";
import { Fuego } from "../lib/fuego";
import { FuegoProvider } from "@nandorojo/swr-firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const fuego = new Fuego(firebaseConfig);

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope,
            );
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          },
        );
      });
    }
  }, []);

  return (
    <FuegoProvider fuego={fuego}>
      <Component {...pageProps} />
    </FuegoProvider>
  );
}
