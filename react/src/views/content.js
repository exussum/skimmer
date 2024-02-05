import { useState, useContext, createContext } from "react";
import { AuthContext } from "../api/auth";
import { useAddGroupMutation, useDeleteGroupMutation, fetchGroups } from "../api/group";
import { useHideMutation, useSetGroupMutation } from "../api/message";
import { getChannel } from "../api/channel";
import { useQueries } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import Button from "react-bootstrap/Button";
import Loading from "../component/loading-status";
import InPlaceModal from "../component/modal";

const GroupContext = createContext(null);

export const Content = () => {
  const { ctx } = useContext(AuthContext);

  if (ctx.selectedChannelId) {
    return <LoadingContent channelId={ctx.selectedChannelId} />;
  } else {
    return "";
  }
};

const LoadingContent = ({ channelId }) => {
  const { t } = useTranslation();
  const [messageResults, groupResults] = useQueries({
    queries: [
      {
        queryKey: ["channel", channelId],
        queryFn: getChannel,
        refetchInterval: 6000,
        refetchIntervalInBackground: true,
      },
      { queryKey: ["groups", channelId], queryFn: fetchGroups },
    ],
  });

  const [processing, setProcessing] = useState(false);

  if (messageResults.data && groupResults.data) {
    return (
      <GroupContext.Provider value={{ groups: groupResults.data, processing, setProcessing }}>
        <div className="flex-1 flex-col">
          <Groups channelId={channelId} />
          <Messages messages={messageResults.data} channelId={channelId} />
        </div>
      </GroupContext.Provider>
    );
  } else {
    return (
      <div className="p-2 flex-1 flex-col bg-menu">
        <div>Loading:</div>
        <ul className="list-inside">
          <li className="flex items-center">
            <Loading value={groupResults.data} error={groupResults.isError} />
            {t("Groups Title")}
          </li>
          <li className="flex items-center">
            <Loading value={messageResults.data} error={messageResults.isError} />
            {t("Messages Title")}
          </li>
        </ul>
      </div>
    );
  }
};

const Groups = ({ channelId }) => {
  const { groups, processing, setProcessing } = useContext(GroupContext);
  const [visible, setVisible] = useState(false);
  const addMutation = useAddGroupMutation(channelId, setProcessing);
  const deleteMutation = useDeleteGroupMutation(channelId, setProcessing);
  const { t } = useTranslation();

  return (
    <>
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
          groups={groups}
          className="border-2"
          deleteGroup={(id) => {
            deleteMutation.mutate({ channelId, id });
          }}
          addGroup={(name) => {
            name && addMutation.mutate({ channelId, name });
          }}
        />
      </InPlaceModal>
    </>
  );
};

const Messages = ({ channelId, messages }) => {
  const { groups, setProcessing } = useContext(GroupContext);
  const setGroupMutation = useSetGroupMutation(setProcessing);
  const hideMutation = useHideMutation(channelId);

  return (
    <MessageList
      hide={(messageIds) => {
        hideMutation.mutate({ messageIds });
      }}
      setGroup={(groupId, messageIds) => {
        setGroupMutation.mutate(
          { groupId, messageIds },
          {
            onSuccess: () => {
              messages.forEach((e) => {
                if (messageIds.includes(e.id)) {
                  e.groupId = groupId;
                }
              });
            },
          },
        );
      }}
      messages={messages}
      groups={groups}
    />
  );
};
