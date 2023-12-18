import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../api/auth";
import { addGroup, deleteGroup, fetchGroups } from "../api/group";
import { getChannel } from "../api/channel";
import { useQueryClient, useQueries, useMutation } from "react-query";
import { MessageList } from "../component/channel";
import { GroupManager } from "../component/group";
import { useTranslation } from "react-i18next";
import Button from "react-bootstrap/Button";

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
        <NonButtonDropDown visible={visible} setVisible={setVisible}>
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
      </div>
    );
  } else {
    return (
      <div className="flex-1 flex-col bg-menu">
        <div>Loading:</div>
        <ul class="list-inside">
          <li class="flex items-center">
            <Check value={groupResults.data} />
            Groups
          </li>
          <li class="flex items-center">
            <Check value={channelResults.data} />
            Messages
          </li>
        </ul>
      </div>
    );
  }
};

const Check = ({ value }) => {
  if (value !== undefined)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  else
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
};
