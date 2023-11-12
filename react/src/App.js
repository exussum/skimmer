import { loginRedirect, logout, getWhoAmi } from "./api/auth";
import {
  useCallback,
  useEffect,
  useContext,
  createContext,
  useState,
} from "react";
import "./App.css";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";

const DEFAULT = { status: null, login: null };
export const AuthContext = createContext(DEFAULT);
const queryClient = new QueryClient();

function App() {
  const [ctx, setCtx] = useState(DEFAULT);
  return (
    <AuthContext.Provider value={{ ctx, setCtx }}>
      <QueryClientProvider client={queryClient}>
        <LoginBar />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}

export const LoginBar = () => {
  const { ctx } = useContext(AuthContext);
  const Component = STATUS_TO_COMPONENT[ctx.status];
  console.log(ctx, Component);
  return <Component />;
};

export const WhoAmI = () => {
  const { setCtx } = useContext(AuthContext);
  const { isLoading, data, error } = useQuery(["whoami"], getWhoAmi, {
    cacheTime: 0,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!data || error) {
        setCtx({ status: "anonymous" });
      } else {
        setCtx({ status: "known", login: data });
      }
    }
  }, [setCtx, data, error, isLoading]);
};

export const Authenticate = () => {
  const { setCtx } = useContext(AuthContext);
  const { isLoading, data, error } = useQuery(
    ["loginRedirect"],
    loginRedirect,
    { cacheTime: 0 },
  );

  useEffect(() => {
    if (!isLoading) {
      if (!data || error) {
        setCtx({ status: "anonymous" });
      } else {
        window.location = data;
      }
    }
  }, [setCtx, data, error, isLoading]);
};

export const Anonymous = () => {
  const { setCtx } = useContext(AuthContext);
  return (
    <>
      <input
        value="Authenticate"
        type="button"
        onClick={useCallback(() => setCtx({ status: "auth" }))}
      />
    </>
  );
};

export const LoginInfo = () => {
  const { ctx, setCtx } = useContext(AuthContext);
  return (
    <>
      Login: {ctx.login} |{" "}
      <input
        value="Logout"
        type="button"
        onClick={useCallback(() => setCtx({ status: "logout" }))}
      />
    </>
  );
};

export const Logout = () => {
  const { setCtx } = useContext(AuthContext);

  const { isLoading, isError } = useQuery(["logout"], logout, { cacheTime: 0 });
  if (!isLoading && !isError) {
    document.cookie =
      "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setCtx({ status: "anonymous" });
  }
  return <>Processing...</>;
};

const STATUS_TO_COMPONENT = {
  null: WhoAmI,
  auth: Authenticate,
  logout: Logout,
  known: LoginInfo,
  anonymous: Anonymous,
};

export default App;
