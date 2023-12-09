import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../api/auth";
import { addGroup, deleteGroup, fetchGroups } from "../api/group";
import { getChannel } from "../api/channel";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import { Button } from "flowbite-react";

export const Content = () => {
  const { ctx } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const dropDownRef = useRef(null);

  const channel = ctx.selectedChannel || (ctx.subbedChannels.length && ctx.subbedChannels[0].id);

  const { t } = useTranslation();

  const dismiss = useCallback(
    (e) => {
      setVisible(dropDownRef.current.contains(e.target));
    },
    [dropDownRef, setVisible],
  );
  useEffect(() => {
    document.body.addEventListener("click", dismiss);
    return () => {
      document.body.removeEventListener("click", dismiss);
    };
  }, [dismiss, setVisible]);

  if (channel) {
    return (
      <div className="flex-1 flex flex-col">
        <div
          ref={dropDownRef}
          onClick={() => {
            setVisible(true);
          }}
          className="w-min"
        >
          <Button className="bg-popup w-min whitespace-nowrap">{t("Show group manager")}</Button>
          <div className={`relative ${visible ? "" : "hidden"}`}>
            <LoadGroupManager channelId={channel} className="absolute border-2" />
          </div>
        </div>
        <LoadContent channelId={channel} />
      </div>
    );
  } else {
    return "";
  }
};

export const LoadGroupManager = ({ channelId, className }) => {
  const [, setProcessing] = useState(false);
  const key = ["groups", channelId];
  const { isLoading, data } = useQuery(key, fetchGroups);
  const queryClient = useQueryClient();

  const addMutation = useMutation(addGroup, {
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const deleteMutation = useMutation(deleteGroup, {
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const stuff = (bigId, id) => {};

  return (
    <GroupManager
      processing={isLoading}
      data={data}
      className={className}
      selectGroup={(id) => stuff("select", id)}
      deleteGroup={(id) => {
        setProcessing(true);
        deleteMutation.mutate({ channelId: channelId, id: id });
      }}
      addGroup={(name) => {
        if (name) {
          setProcessing(true);
          addMutation.mutate({ channelId: channelId, name: name });
        }
      }}
    />
  );
};

const LoadContent = ({ channelId }) => {
  const [items, setItems] = useState([]);
  const { isLoading, data } = useQuery(["channel", channelId], getChannel);

  useEffect(() => {
    if (!isLoading && data) {
      setItems(data);
    } else {
      setItems([]);
    }
  }, [data, setItems, isLoading]);

  return <MessageList data={items} />;
};
