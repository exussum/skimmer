import { useContext } from "react";
import { ChannelNav } from "../component/channel";
import { AuthContext } from "../api/auth";

export const SideNav = (props) => {
  const { ctx } = useContext(AuthContext);
  if (ctx && ctx.channels) {
    return (
      <ChannelNav
        className={props.className}
        channels={ctx.channels
          .filter((e) => e.id)
          .map((e) => {
            return { id: e.id, name: e.channel_type };
          })}
      />
    );
  }
  return <div className={props.className}></div>;
};
