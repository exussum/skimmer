import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../api/auth";
import { addGroup, deleteGroup, fetchGroups } from "../api/group";
import { getChannel } from "../api/channel";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import { Button } from "flowbite-react";

export const NonButtonDropDown = (props) => {
  const dropDownRef = useRef(null);

  const dismiss = useCallback(
    (e) => {
      props.setVisible(dropDownRef.current.contains(e.target));
    },
    [dropDownRef, props],
  );

  useEffect(() => {
    document.body.addEventListener("click", dismiss);
    return () => {
      document.body.removeEventListener("click", dismiss);
    };
  }, [dismiss]);

  return (
    <div ref={dropDownRef}>
      <div className={`relative ${props.visible ? "" : "hidden"} w-min`}>
        <div className="absolute">{props.children}</div>
      </div>
    </div>
  );
};

export const Content = () => {
  const { ctx } = useContext(AuthContext);
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const click = (e) => {
    setVisible(!visible);
    e.stopPropagation();
  };

  if (ctx.selectedChannel) {
    return (
      <div className="flex-1 flex flex-col">
        <Button onClick={click} className="bg-popup w-min whitespace-nowrap">
          {t("Show group manager")}
        </Button>
        <NonButtonDropDown visible={visible} setVisible={setVisible}>
          <LoadGroupManager channelId={ctx.selectedChannel.id} className="border-2" />
        </NonButtonDropDown>
        <LoadContent channelId={ctx.selectedChannel.id} />
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
