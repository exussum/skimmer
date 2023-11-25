import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import { QueryClient, QueryClientProvider } from "react-query";
import { Header } from "./views/header";
import { Go } from "./component/group";
import { AuthContext, useAuthState } from "./api/auth";

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

const queryClient = new QueryClient();

export const App = () => {
  const [ctx, setCtx] = useAuthState();
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
};

export default App;

const Body = () => {
  return <Go channelId="1" />;
};
