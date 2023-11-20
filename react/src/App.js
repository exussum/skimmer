import { loginRedirect, logout, getWhoAmi } from "./api/auth";
import { Flowbite } from 'flowbite-react';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { useTranslation } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { useCookies } from "react-cookie";
import {
  useCallback,
  useEffect,
  useContext,
  createContext,
  useState,
} from "react";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { Dropdown } from "flowbite-react";
import { Modal } from "flowbite-react";

i18n.use(initReactI18next).use(Backend).init({
    fallbackLng: 'en',
    lng: 'en',
    ns: 'ns',
    backend: {
      loadPath: 'http://localhost:8000/i18n/get'
    },
  });



const DEFAULT = { status: null, login: null };
const AuthContext = createContext(DEFAULT);
const queryClient = new QueryClient();

export const App = () => {
  const [ctx, setCtx] = useState(DEFAULT);
  return (
    <div className="h-screen px-8 py-8">
      <div className="h-full px-2 py-2 bg-content rounded-l ">
      <AuthContext.Provider value={{ ctx, setCtx }}>
        <QueryClientProvider client={queryClient}>
          <Header />
          <Body />
        </QueryClientProvider>
      </AuthContext.Provider>
    </div>
    </div>
  );
}

///

const Body = () => {
   return <div>Hi</div>
}

///

const Header = () => {
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

const WhoAmI = () => {
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

const Authenticate = () => {
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
  return    <GoogleButton disabled={true}>

  </GoogleButton>
};

const GoogleButton = (props) => {
  const { t } = useTranslation();
  return (
    <div className={props.disabled ? "opacity-50" : ""}>
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
        onClick={props.onClick}
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
            <div>{t('Sign in with Google')}</div>
      </button>
    </div>
   )
}

const Anonymous = () => {
  const [cookies] = useCookies(["guest"]);
  const { setCtx } = useContext(AuthContext);

  return (
    <>
      <GoogleButton onClick={useCallback(() => setCtx({ status: "auth" }), [setCtx])}/>
      {cookies.guest ? <GuestUserWarning /> : ""}
    </>
  );
};

const GuestUserWarning = () => {
  const [, setCookie] = useCookies(["guest"]);
  const { t } = useTranslation();

  const theme = {
      modal: {
          header: { 
            title: "text-white"
          },
          body: {
            title: "text-white"
          },
          content: {inner: "bg-popup"}
      }
  };

  return (
    <Flowbite theme={{theme: theme}}>
        <Modal
          show={true}
          onClose={useCallback(() => {
            setCookie("guest", false);
          }, [setCookie])}
        >
          <Modal.Header>Hi!</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <p className="text-base leading-relaxed">
                {t('Contact the owner to be added')}
              </p>
            </div>
          </Modal.Body>
        </Modal>
    </Flowbite>
  );
};

const LoginInfo = () => {
  const { ctx, setCtx } = useContext(AuthContext);
  const { t } = useTranslation();
  const theme = {
     dropdown: {
        floating: {
            "arrow": {
              "style": {
                "auto": "bg-popup",
              }
            },
        item: { container: "bg-menu", base:  "flex items-center justify-start py-2 px-4 text-sm  w-full hover:bg-popup focus:bg-popup  focus:outline-none"},
        style: { "auto": "bg-menu text-white" }
        },
     }
  };

  return (
    <Flowbite theme={{theme: theme}}>
      <Dropdown inline label={ctx.login}>
        <Dropdown.Item
          onClick={useCallback(() => setCtx({ status: "logout" }), [setCtx])}
        >
          <div>{t('Logout')}</div>
        </Dropdown.Item>
      </Dropdown>
    </Flowbite>
  );
};

const Logout = () => {
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
