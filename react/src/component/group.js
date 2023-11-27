import { Button, TextInput } from "flowbite-react";
import { apiClient } from "../config";
import { useRef, useCallback, useState } from "react";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { Flowbite } from "flowbite-react";
import { useTranslation } from "react-i18next";

const FIELD_THEME = {
  textInput: {
    field: {
      input: {
        withAddon: {
          off: "flex-1 rounded-l-lg",
        },
      },
    },
  },
};

export const Listing = (props) => {
  const items = props.data
    ? props.data.map((item, i) => {
        return (
          <ListItem
            key={i}
            itemId={item.id}
            itemName={item.name}
            selectGroup={props.selectGroup}
            deleteGroup={props.deleteGroup}
          />
        );
      })
    : [];

  const [value, setValue] = useState("");
  const textInputRef = useRef(null);
  const { t } = useTranslation();

  return (
    <div className="bg-menu flex flex-col w-80 p-2 rounded-lg">
      {items}
      <div className="flex-1 flex">
        <Flowbite theme={{ theme: FIELD_THEME }}>
          <TextInput
            enabled={(!props.processing).toString()}
            className="flex-1"
            ref={textInputRef}
            placeholder={t("New Group Placeholder")}
            onChange={useCallback(
              (r) => setValue(r.currentTarget.value),
              [setValue],
            )}
          />
        </Flowbite>
        <Button
          enabled={(!props.processing).toString()}
          color="{ props.processing ? 'dark' : 'black' }"
          className="flex-initial bg-popup rounded-none rounded-r-lg"
          onClick={useCallback(
            (r) => {
              props.addGroup(value);
              textInputRef.current.value = "";
            },
            [value, props, textInputRef],
          )}
        >
          {t("Add Group Submit")}
        </Button>
      </div>
    </div>
  );
};

const ListItem = (props) => {
  const { itemId, selectGroup, deleteGroup } = props;
  const selectCallback = useCallback(
    () => selectGroup(itemId),
    [itemId, selectGroup],
  );
  const deleteCallback = useCallback(
    () => deleteGroup(itemId),
    [itemId, deleteGroup],
  );
  return (
    <div className="flow-initial">
      <div className="flex items-center">
        <div className="flex-1" onClick={selectCallback}>
          {props.itemName}
        </div>
        <Button className="flex-initial" onClick={deleteCallback}>
          x
        </Button>
      </div>
    </div>
  );
};

export const fetchGroups = async ({ queryKey }) => {
  const [, channelId] = queryKey;
  return apiClient.get(`/group/${channelId}`).then((res) => res.data);
};

export const addGroup = async ({ name, channelId }) => {
  const params = new URLSearchParams({
    name: name,
  });
  return apiClient.post(`/group/${channelId}`, params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const deleteGroup = async ({ channelId, id }) => {
  return apiClient.delete(`/group/${channelId}/${id}`);
};

export const Go = (props) => {
  const channelId = props.channelId;
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
    <Listing
      processing={isLoading}
      data={data}
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
