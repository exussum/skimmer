import { useContext, useState, useCallback } from "react";
import { ChannelNav } from "../component/channel";
import { AuthContext } from "../api/auth";
import { useStatsQuery } from "../api/channel";

export const SideNav = () => {
  const { ctx, setCtx } = useContext(AuthContext);
  const { data } = useStatsQuery();
  const [messageCounts, setMessageCounts] = useState({});
  const reset = useCallback(() => {
    setMessageCounts({});
  }, [localStorage]);

  if (data) {
    if (localStorage.getItem("lastSeenMessageId") < data.lastMessageId) {
      for (const k of data.channelStats) {
        messageCounts[k.id] = (messageCounts[k.id] || 0) + k.messages;
      }
      setMessageCounts(messageCounts);
      Notification.requestPermission().then(() => {
        new Notification("Skimmer has new notifications").onclick = reset;
      });
    }
    localStorage.setItem("lastSeenMessageId", data.lastMessageId);
  }

  const select = useChannel(ctx, setCtx);
  if (ctx && ctx.subbedChannels.length) {
    return <ChannelNav onSelect={select} channels={ctx.subbedChannels} messageCounts={messageCounts} />;
  }
  return <div></div>;
};

const useChannel = (ctx, setCtx) => {
  return (e) => {
    setCtx({ ...ctx, selectedChannelId: e });
  };
};
