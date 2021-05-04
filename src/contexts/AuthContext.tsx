import { createContext, ReactNode, useState } from "react";
import Router from "next/router";
import { setCookie } from "nookies";
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SessionsResponse = {
  token: string;
  permissions: string[];
  refreshToken: string;
  roles: string[];
};

type SignInCreadentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCreadentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;
  const configCookie = {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  };

  async function signIn({ email, password }: SignInCreadentials) {
    try {
      const response = await api.post<SessionsResponse>("sessions", {
        email,
        password,
      });

      const { permissions, roles, refreshToken, token } = response.data;

      setCookie(undefined, "nextauth.token", token, configCookie);
      setCookie(undefined, "nextauth.refreshToken", refreshToken, configCookie);

      setUser({
        email,
        permissions,
        roles,
      });

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}
