import { AuthContext, useLoginRedirectQuery, useLogoutQuery, useWhoAmIQuery } from "../api/auth";
import { useDeleteChannelMutation } from "../api/channel";
import { UserMenu, GuestUserWarning, GoogleButton } from "../component/auth";
import { useContext, useEffect } from "react";

import { useCookies } from "react-cookie";

export const Header = ({ className }) => {
  const { ctx, setCtx } = useContext(AuthContext);

  const component = {
    null: <UnknownUser />,
    auth: <AuthRedirect />,
    logout: <Logout />,
    known: (
      <UserMenu
        login={ctx.email}
        onClick={() => setCtx({ status: "logout" })}
        channels={ctx.channels}
        deleteChannel={useDeleteChannelClick(ctx, setCtx)}
      />
    ),
    anonymous: <Anonymous />,
  }[ctx.status];

  return (
    <div className={`flex ${className}`}>
      <div className="flex-1">Skimmer</div>
      <div className="flex-none">{component}</div>
    </div>
  );
};

const UnknownUser = () => {
  const { setCtx, isLoading, data, error } = useWhoAmIQuery();

  useEffect(() => {
    if (!isLoading) {
      if (error || !data.email) {
        setCtx({ status: "anonymous" });
      } else {
        const activeChannels = data.channels.filter((e) => e.id);
        setCtx({
          status: "known",
          email: data.email,
          channels: data.channels,
          selectedChannelId: activeChannels.length && activeChannels[0].id,
          subbedChannels: activeChannels,
        });
      }
    }
  });
  return <GoogleButton disabled={true} />;
};

const AuthRedirect = () => {
  const { setCtx, isLoading, data, error } = useLoginRedirectQuery();

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

const Anonymous = () => {
  const [cookies, setCookie] = useCookies(["guest"]);
  const { setCtx } = useContext(AuthContext);

  return (
    <>
      <GoogleButton
        onClick={() => {
          setCtx({ status: "auth" });
        }}
      />
      {cookies.guest ? (
        <GuestUserWarning
          onClick={() => {
            setCookie("guest", false);
          }}
        />
      ) : (
        ""
      )}
    </>
  );
};

const Logout = () => {
  const { setCtx, isLoading, isError } = useLogoutQuery();

  useEffect(() => {
    if (!isLoading && !isError) {
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setCtx({ status: "anonymous" });
    }
  });
  return <GoogleButton disabled={true} />;
};

const useDeleteChannelClick = (ctx, setCtx) => {
  const onSuccess = async (id) => {
    const channels = ctx.channels.map((e) => {
      return {
        ...e,
        id: e.id === id ? null : e.id,
      };
    });

    const subbedChannels = channels.filter((e) => e.id);

    if (ctx.selectedChannelId === id) {
      ctx.selectedChannelId = subbedChannels.length && subbedChannels[0].id;
    }

    setCtx({ ...ctx, channels: channels, subbedChannels: subbedChannels });
  };
  return useDeleteChannelMutation(onSuccess);
};
