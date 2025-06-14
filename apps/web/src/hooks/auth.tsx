import React, { createContext } from "react";
import { createClient } from "@openauthjs/openauth/client";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const client = createClient({
  clientID: "web-app",
  issuer: `http://localhost:3000`,
});

const origin = location.origin;

interface AuthContextType {
  loaded: boolean;
  loggedIn: boolean;
  logout: () => void;
  login: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children?: React.JSX.Element }) {
  const mounted = React.useRef(true);
  const [loaded, setLoaded] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const token = React.useRef<string | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshTokens = React.useCallback(async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return;
    const next = await client.refresh(refresh, {
      access: token.current,
    });
    if (next.err) return;
    if (!next.tokens) return token.current;

    localStorage.setItem("refresh", next.tokens.refresh);
    token.current = next.tokens.access;

    return next.tokens.access;
  }, []);

  const auth = React.useCallback(async () => {
    const token = await refreshTokens();

    if (token) {
      setLoggedIn(true);
    }

    setLoaded(true);
  }, [refreshTokens]);

  const login = React.useCallback(async () => {
    const { challenge, url } = await client.authorize(
      origin + location.pathname,
      "code",
      {
        pkce: true,
      }
    );
    sessionStorage.setItem("challenge", JSON.stringify(challenge));
    window.location.href = url;
  }, [location.pathname]);

  const getToken = React.useCallback(async () => {
    const token = await refreshTokens();

    if (!token) {
      return null;
    }

    return token;
  }, [refreshTokens]);

  const callback = React.useCallback(
    async (code: string, state: string) => {
      const challenge = JSON.parse(sessionStorage.getItem("challenge")!);
      if (code) {
        if (state === challenge.state && challenge.verifier) {
          const exchanged = await client.exchange(
            code!,
            origin + location.pathname,
            challenge.verifier
          );
          if (!exchanged.err) {
            token.current = exchanged.tokens?.access;
            localStorage.setItem("refresh", exchanged.tokens.refresh);
          }
          window.location.href = location.pathname;
        }
      }
    },
    [location.pathname]
  );

  const logout = React.useCallback(() => {
    navigate("/");
    setTimeout(() => {
      localStorage.removeItem("refresh");
      sessionStorage.removeItem("challenge");
      token.current = undefined;
      setLoggedIn(false);
    }, 15);
  }, [navigate]);

  React.useEffect(() => {
    const hash = new URLSearchParams(location.search.slice(1));
    const code = hash.get("code");
    const state = hash.get("state");

    if (!mounted.current) {
      return;
    }

    mounted.current = false;

    if (code && state) {
      callback(code, state);
      return;
    }

    auth();

    return () => {
      mounted.current = true;
    };
  }, [auth, callback, location.search]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        loaded,
        loggedIn,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return React.useContext(AuthContext);
}
