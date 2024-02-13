import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { SKIMMER_API_URL } from "./config";

import Backend from "i18next-http-backend";
import React from "react";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { AuthContext, useAuthState } from "./api/auth";
import { Content } from "./views/content";
import { CookiesProvider } from "react-cookie";
import { Header } from "./views/header";
import { MouseInUseContext, useMouseInUseState } from "./api/mouse";
import { QueryClient, QueryClientProvider } from "react-query";
import { SideNav } from "./views/sidenav";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(Backend)
  .init({
    fallbackLng: "en",
    lng: "en",
    ns: "ns",
    backend: {
      loadPath: SKIMMER_API_URL + "/i18n/get",
    },
  });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, cacheTime: 0, retry: false } },
});

const App = () => {
  const [ctx, setCtx] = useAuthState();
  const mouseInUse = useMouseInUseState(document);

  return (
    <AuthContext.Provider value={{ ctx, setCtx }}>
      <MouseInUseContext.Provider value={mouseInUse}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col md:mx-8 px-8 pt-8 bg-content rounded-l">
            <Header className="basis-16 border-0 border-b-2 border-solid border-b-menu" />
            {ctx.email ? (
              <div className="grow">
                <div className="h-full flex flex-col sm:flex-row">
                  <SideNav />
                  <Content />
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </QueryClientProvider>
      </MouseInUseContext.Provider>
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
