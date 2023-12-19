import { useState, useContext } from "react";
import { AuthContext } from "../api/auth";
import { setGroup, addGroup, deleteGroup, fetchGroups } from "../api/group";
import { getChannel } from "../api/channel";
import { useQueryClient, useQueries, useMutation } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import Button from "react-bootstrap/Button";
import Loading from "../component/loading-status";
import InPlaceModal from "../component/modal";

export const Content = () => {
  const { ctx } = useContext(AuthContext);

  if (ctx.selectedChannelId) {
    return <LoadContent channelId={ctx.selectedChannelId} />;
  } else {
    return "";
  }
};

const useHandlers = (channelId, setProcessing) => {
  const queryClient = useQueryClient();
  const addMutation = useMutation(addGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });

  const deleteMutation = useMutation(deleteGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelId });
      setProcessing(false);
    },
  });

  const setGroupMutation = useMutation(setGroup, {
    onMutate: () => {
      setProcessing(true);
    },
    onSuccess: () => {
      setProcessing(false);
    },
  });

  return [addMutation, deleteMutation, setGroupMutation];
};

const LoadContent = ({ channelId }) => {
  const [processing, setProcessing] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  const [messageResults, groupResults] = useQueries({
    queries: [
      { queryKey: ["channel", channelId], queryFn: getChannel, refetchInterval: 6000 },
      { queryKey: ["groups", channelId], queryFn: fetchGroups },
    ],
  });

  const [addMutation, deleteMutation, setGroupMutation] = useHandlers(channelId, setProcessing);

  if (messageResults.data && groupResults.data) {
    return (
      <div className="flex-1 flex-col">
        <Button
          variant="skimmer"
          onClick={(e) => {
            setVisible(!visible);
            e.stopPropagation();
          }}
          className="bg-popup w-min whitespace-nowrap"
        >
          {t("Show group manager")}
        </Button>
        <InPlaceModal visible={visible} setVisible={setVisible}>
          <GroupManager
            processing={processing}
            data={groupResults.data || []}
            className="border-2"
            deleteGroup={(id) => {
              deleteMutation.mutate({ channelId: channelId, id: id });
            }}
            addGroup={(name) => {
              name && addMutation.mutate({ channelId: channelId, name: name });
            }}
          />
        </InPlaceModal>
        <MessageList
          setGroup={(groupId, messageIds) =>
            setGroupMutation.mutate({ channelId: channelId, groupId: groupId, messageIds: messageIds })
          }
          messages={messageResults.data || []}
          groups={groupResults.data || []}
        />
      </div>
    );
  } else {
    return (
      <div className="p-2 flex-1 flex-col bg-menu">
        <div>Loading:</div>
        <ul className="list-inside">
          <li className="flex items-center">
            <Loading value={groupResults.data} />
            Groups
          </li>
          <li className="flex items-center">
            <Loading value={messageResults.data} />
            Messages
          </li>
        </ul>
      </div>
    );
  }
};
