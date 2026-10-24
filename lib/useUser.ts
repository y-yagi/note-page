import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";
import firebase from "firebase/app";
import "firebase/auth";
import {
  removeUserCookie,
  setUserCookie,
  getUserFromCookie,
} from "./userCookies";
import { mapUserData } from "./mapUserData";
import UserType from "../types/user";

const useUser = () => {
  const [user, setUser] = useState<UserType | undefined>(getUserFromCookie);
  const router = useRouter();

  const clearCache = () => mutate(() => true, undefined, { revalidate: false });

  const logout = async () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        clearCache();
        router.push("/auth");
      })
      .catch((e) => {
        console.error(e);
      });
  };

  useEffect(() => {
    // Firebase updates the id token every hour, this
    // makes sure the react state and the cookie are
    // both kept up to date
    let currentUserId = getUserFromCookie()?.id;
    firebase.auth().onIdTokenChanged((user) => {
      if (user) {
        const userData = mapUserData(user);
        // Drop the previous account's cached data when the user changes
        if (currentUserId !== userData.id) {
          clearCache();
          currentUserId = userData.id;
        }
        setUserCookie(userData);
        setUser(userData);
      } else {
        removeUserCookie();
        setUser(undefined);
        clearCache();
        currentUserId = undefined;
      }
    });

    if (!getUserFromCookie()) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, logout };
};

export { useUser };
