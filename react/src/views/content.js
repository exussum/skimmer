import { useState, useEffect, useContext } from "react";
import { useQuery } from "react-query";
import { apiClient } from "../config";
import { AuthContext } from "../api/auth";

const getChannel = async ({ queryKey }) => {
  return apiClient.get(`/channel/${queryKey[1]}`).then((r) => r.data);
};

export const Content = () => {
  const { ctx } = useContext(AuthContext);
  const channel =
    ctx.selectedChannel ||
    (ctx.subbedChannels.length && ctx.subbedChannels[0].id);

  if (channel) {
    return <LoadContent channel={channel} />;
  } else {
    return "";
  }
};

const LoadContent = ({ channel }) => {
  const [items, setItems] = useState([]);
  const { isLoading, data, isError, error } = useQuery(
    ["channel", channel],
    getChannel,
  );

  useEffect(() => {
    if (!isLoading && data) {
      setItems(data);
    } else {
      setItems([]);
    }
  }, [data, setItems, isLoading]);

  return <ChannelList data={items} />;
};

const ChannelList = ({ data }) => {
  const contents = data.map((e) => (
    <Item key={`${e.id}`} from={e.from} title={e.title} date={e.date} />
  ));
  return (
    <div className="bg-menu flex-1 flex flex-col overflow-hidden">
      {contents}
    </div>
  );
};

const Item = ({ id, from, title, date }) => {
  return (
    <div className="flex">
      <div className="flex-0 p-2">
        <input type="checkbox" />
      </div>
      <div className="basis-64 p-2 text-ellipsis overflow-hidden whitespace-nowrap">
        {from}
      </div>
      <div className="flex-1 p-2 text-ellipsis overflow-hidden whitespace-nowrap">
        {title}
      </div>
      <div className="basis-64 p-2">{date}</div>
    </div>
  );
};
