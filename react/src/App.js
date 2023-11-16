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
import { Dropdown } from "flowbite-react";

const DEFAULT = { status: null, login: null };
export const AuthContext = createContext(DEFAULT);
const queryClient = new QueryClient();

function App() {
  const [ctx, setCtx] = useState(DEFAULT);
  return (
    <div className="mx-8 mt-8">
      <AuthContext.Provider value={{ ctx, setCtx }}>
        <QueryClientProvider client={queryClient}>
          <Header />
        </QueryClientProvider>
      </AuthContext.Provider>
    </div>
  );
}

export const Header = () => {
  const { ctx } = useContext(AuthContext);
  const Component = STATUS_TO_COMPONENT[ctx.status];
  return (
    <div className="flex">
      <div className="flex-1">Skimmer</div>
      <div className="flex-none">
        <Component />
      </div>
    </div>
  );
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
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
        onClick={useCallback(() => setCtx({ status: "auth" }), [setCtx])}
      >
        <svg
          className="w-4 h-4 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 19"
        >
          <path
            fillRule="evenodd"
            d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
            clipRule="evenodd"
          />
        </svg>
        Sign in with Google
      </button>
    </>
  );
};

export const LoginInfo = () => {
  const { ctx, setCtx } = useContext(AuthContext);
  return (
    <>
      <Dropdown inline label={ctx.login}>
        <Dropdown.Item
          onClick={useCallback(() => setCtx({ status: "logout" }), [setCtx])}
        >
          Logout
        </Dropdown.Item>
      </Dropdown>
    </>
  );
};

export const Logout = () => {
  const { setCtx } = useContext(AuthContext);

  const { isLoading, isError } = useQuery(["logout"], logout, { cacheTime: 0 });

  useEffect(() => {
    if (!isLoading && !isError) {
      document.cookie =
        "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setCtx({ status: "anonymous" });
    }
  });
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
