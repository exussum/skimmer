import { useQuery } from "react-query";
import { useState, useEffect } from "react";
import { apiClient } from "../config";

const getChannel = async ({ id }) => {
  return apiClient.get(`/channel/${id}`).then((r) => r.data);
};

export const Content = () => {
  const [items, setItems] = useState([]);
  const { isLoading, data } = useQuery(["channel", 1], getChannel, {
    cacheTime: 0,
  });

  useEffect(() => {
    if (!isLoading && data) {
      setItems(data);
    } else {
      setItems([]);
    }
  }, [items, data, setItems, isLoading]);

  return <ChannelList data={items} />;
};

const ChannelList = ({ data }) => {
  const contents = data.map((e) => (
    <Item id={e.id} title={e.title} date={e.date} />
  ));
  return (
    <div className="bg-menu flex-1 flex flex-col overflow-hidden">
      {contents}
    </div>
  );
};

const Item = ({ id, title, date }) => {
  return (
    <div className="flex">
      <div className="flex-0 p-2">
        <input type="checkbox" />
      </div>
      <div className="basis-64 p-2 text-ellipsis overflow-hidden whitespace-nowrap">
        This is from bob
      </div>
      <div className="flex-1 p-2 text-ellipsis overflow-hidden whitespace-nowrap">
        {title}
      </div>
      <div className="basis-64 p-2">{date}</div>
    </div>
  );
};
