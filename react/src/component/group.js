import { Button, TextInput } from "flowbite-react";
import { apiClient } from "../config";
import { useCallback, useState } from "react";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { Flowbite } from "flowbite-react";

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
  console.log(items, props.data);

  const [value, setValue] = useState("");

  const theme = {
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

  return (
    <div className="bg-menu flex flex-col w-80 p-2 rounded-lg">
      {items}
      <div className="flex-1 flex">
        <Flowbite theme={{ theme: theme }}>
          <TextInput
            enabled={(!props.processing).toString()}
            className="flex-1"
            placeholder="New Group"
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
          onClick={useCallback((r) => props.addGroup(value), [value, props])}
        >
          Add
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

export const fetchGroups = async () => {
  return apiClient.get("/group/").then((res) => res.data);
};

export const addGroup = async (name) => {
  const params = new URLSearchParams({
    name: name,
  });
  return apiClient.post("/group/", params, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
};

export const deleteGroup = async (id) => {
  return apiClient.delete(`/group/${id}`);
};

export const Go = (id) => {
  const [, setProcessing] = useState(false);
  const { isLoading, isError, data } = useQuery(["groups"], fetchGroups);
  const queryClient = useQueryClient();

  const addMutation = useMutation(addGroup, {
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
  const deleteMutation = useMutation(deleteGroup, {
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const stuff = (bigId, id) => {
    console.log("hi");
  };

  return (
    <Listing
      processing={isLoading}
      data={data}
      selectGroup={(id) => stuff("select", id)}
      deleteGroup={(id) => {
        setProcessing(true);
        deleteMutation.mutate(id);
      }}
      addGroup={(name) => {
        if (name) {
          setProcessing(true);
          addMutation.mutate(name);
        }
      }}
    />
  );
};
