import { useQuery } from "react-query";
import { AuthContext, loginRedirect, logout, getWhoAmi } from "../api/auth";
import { UserMenu, GuestUserWarning, GoogleButton } from "../component/auth";
import { useContext, useCallback, useEffect } from "react";

import { useCookies } from "react-cookie";

export const Header = () => {
  const { ctx } = useContext(AuthContext);
  const component = {
    null: <WhoAmIQuery />,
    auth: <AuthRedirectQuery />,
    logout: <LogoutQuery />,
    known: <UserMenu login={ctx.login} onClick={useUserMenuOnClick()} />,
    anonymous: <Anonymous />,
  }[ctx.status];

  return (
    <div className="flex">
      <div className="flex-1">Skimmer</div>
      <div className="flex-none">{component}</div>
    </div>
  );
};

const WhoAmIQuery = () => {
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

const AuthRedirectQuery = () => {
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
  return <GoogleButton disabled={true} />;
};

const useAuthOnClick = () => {
  const { setCtx } = useContext(AuthContext);
  return useCallback(() => setCtx({ status: "auth" }), [setCtx]);
};

const useGuestOnClick = () => {
  const [, setCookie] = useCookies(["guest"]);
  return useCallback(() => {
    setCookie("guest", false);
  }, [setCookie]);
};

const Anonymous = () => {
  const [cookies] = useCookies(["guest"]);
  const onClick = useGuestOnClick();

  return (
    <>
      <GoogleButton onClick={useAuthOnClick()} />
      {cookies.guest ? <GuestUserWarning onClick={onClick} /> : ""}
    </>
  );
};

const LogoutQuery = () => {
  const { setCtx } = useContext(AuthContext);

  const { isLoading, isError } = useQuery(["logout"], logout, { cacheTime: 0 });

  useEffect(() => {
    if (!isLoading && !isError) {
      document.cookie =
        "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setCtx({ status: "anonymous" });
    }
  });
  return <GoogleButton disabled={true} />;
};

const useUserMenuOnClick = () => {
  const { setCtx } = useContext(AuthContext);
  return useCallback(() => setCtx({ status: "logout" }), [setCtx]);
};
