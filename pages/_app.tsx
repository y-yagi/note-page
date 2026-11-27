import { AppProps } from "next/app";
import "semantic-ui-css/semantic.css";
import "../styles/index.css";
import React from "react";
import { useEffect } from "react";
import { initFirebase } from "../lib/firebase";

initFirebase();

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

  return <Component {...pageProps} />;
}
