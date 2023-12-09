import { useContext } from "react";
import { ChannelNav } from "../component/channel";
import { AuthContext } from "../api/auth";

export const SideNav = (props) => {
  const { ctx, setCtx } = useContext(AuthContext);
  const select = useChannel(ctx, setCtx);
  if (ctx && ctx.subbedChannels.length) {
    return <ChannelNav className={props.className} onSelect={select} channels={ctx.subbedChannels} />;
  }
  return <div className={props.className}></div>;
};

const useChannel = (ctx, setCtx) => {
  return (e) => {
    setCtx({ ...ctx, selectedChannel: e });
  };
};
