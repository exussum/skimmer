import { Button, TextInput } from "flowbite-react";
import { useRef, useCallback, useState } from "react";
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

export const GroupManager = (props) => {
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
    <div className={`bg-menu flex flex-col w-80 p-2 rounded-lg ${props.className}`}>
      {items}
      <div className="flex-1 flex">
        <Flowbite theme={{ theme: FIELD_THEME }}>
          <TextInput
            enabled={(!props.processing).toString()}
            className="flex-1"
            ref={textInputRef}
            placeholder={t("New Group Placeholder")}
            onChange={useCallback((r) => setValue(r.currentTarget.value), [setValue])}
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
  const selectCallback = useCallback(() => selectGroup(itemId), [itemId, selectGroup]);
  const deleteCallback = useCallback(() => deleteGroup(itemId), [itemId, deleteGroup]);
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
