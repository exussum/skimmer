import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Backend from "i18next-http-backend";
import React from "react";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { AuthContext, useAuthState } from "./api/auth";
import { SideNav } from "./views/sidenav";
import { CookiesProvider } from "react-cookie";
import { Header } from "./views/header";
import { Content } from "./views/content";
import { QueryClient, QueryClientProvider } from "react-query";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(Backend)
  .init({
    fallbackLng: "en",
    lng: "en",
    ns: "ns",
    backend: {
      loadPath: "http://localhost:8000/i18n/get",
    },
  });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, cacheTime: 0 } },
});

const App = () => {
  const [ctx, setCtx] = useAuthState();

  return (
    <AuthContext.Provider value={{ ctx, setCtx }}>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen flex flex-col mx-8 px-8 pt-8 bg-content rounded-l">
          <Header className="basis-16 border-0 border-b-2 border-solid border-b-menu" />
          {ctx.email ? (
            <div className="grow">
              <div className="h-full flex">
                <SideNav className="w-48 pr-8" />
                <Content />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
);
