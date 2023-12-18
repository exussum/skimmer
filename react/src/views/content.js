import { useState, useContext } from "react";
import { AuthContext } from "../api/auth";
import { addGroup, deleteGroup, fetchGroups } from "../api/group";
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

const useMutations = (channelId, setProcessing) => {
  const queryClient = useQueryClient();
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
  return [addMutation, deleteMutation];
};

const LoadContent = ({ channelId }) => {
  const [processing, setProcessing] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  const [channelResults, groupResults] = useQueries({
    queries: [
      { queryKey: ["channel", channelId], queryFn: getChannel, refetchInterval: 6000 },
      { queryKey: ["groups", channelId], queryFn: fetchGroups },
    ],
  });

  const [addMutation, deleteMutation] = useMutations(channelId, setProcessing);

  if (channelResults.data && groupResults.data) {
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
        </InPlaceModal>
        <MessageList data={channelResults.data || []} groups={groupResults.data || []} />
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
            <Loading value={channelResults.data} />
            Messages
          </li>
        </ul>
      </div>
    );
  }
};
