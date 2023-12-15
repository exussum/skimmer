import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../api/auth";
import { addGroup, deleteGroup, fetchGroups } from "../api/group";
import { getChannel } from "../api/channel";
import { useQueryClient, useQueries, useMutation } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import { Button } from "flowbite-react";

// vv move this into a component
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
// ^^ move this into a component

export const Content = () => {
  const { ctx } = useContext(AuthContext);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const click = (e) => {
    setVisible(!visible);
    e.stopPropagation();
  };

  if (ctx.selectedChannelId) {
    return (
      <div className="flex-1 flex flex-col">
        <Button onClick={click} className="bg-popup w-min whitespace-nowrap">
          {t("Show group manager")}
        </Button>
        <LoadContent
          channelId={ctx.selectedChannelId}
          groupManagerVisible={visible}
          setGroupManagerVisible={setVisible}
        />
      </div>
    );
  } else {
    return "";
  }
};

const LoadContent = ({ channelId, groupManagerVisible, setGroupManagerVisible }) => {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const queryResults = useQueries({
    queries: [
      { queryKey: ["channel", channelId], queryFn: getChannel, refetchInterval: 6000 },
      { queryKey: ["groups", channelId], queryFn: fetchGroups },
    ],
  });

  const channelResults = queryResults[0];
  const groupResults = queryResults[1];

  const addMutation = useMutation(addGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });

  const deleteMutation = useMutation(deleteGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });

  return (
    <>
      <NonButtonDropDown visible={groupManagerVisible} setVisible={setGroupManagerVisible}>
        <GroupManager
          processing={processing}
          data={groupResults.data || []}
          className="border-2"
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
      </NonButtonDropDown>
      <MessageList data={channelResults.data || []} groups={groupResults.data || []} />
    </>
  );
};
