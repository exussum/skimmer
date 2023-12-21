import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export const GroupManager = ({ processing, groups, addGroup, selectGroup, deleteGroup, className }) => {
  const items = groups.map((item, i) => {
    return (
      <ListItem
        key={i}
        itemId={item.id}
        itemName={item.name}
        isSystem={item.system}
        selectGroup={selectGroup}
        deleteGroup={deleteGroup}
      />
    );
  });
  const [value, setValue] = useState("");
  const textInputRef = useRef(null);
  const { t } = useTranslation();

  return (
    <div className={`bg-menu flex flex-col w-80 p-2 rounded-lg ${className}`}>
      {items}
      <div className="flex-1 flex">
        <Form.Control
          type="text"
          enabled={(!processing).toString()}
          className="flex-1"
          ref={textInputRef}
          placeholder={t("New Group Placeholder")}
          onChange={useCallback((r) => setValue(r.currentTarget.value), [setValue])}
        />
        <Button
          enabled={(!processing).toString()}
          color="{ processing ? 'dark' : 'black' }"
          className="flex-initial bg-popup rounded-none rounded-r-lg"
          variant="skimmer"
          onClick={useCallback(
            (r) => {
              addGroup(value);
              textInputRef.current.value = "";
            },
            [value, addGroup, textInputRef],
          )}
        >
          {t("Add Group Submit")}
        </Button>
      </div>
    </div>
  );
};

const ListItem = ({ itemName, itemId, isSystem, selectGroup, deleteGroup }) => {
  const selectCallback = useCallback(() => selectGroup(itemId), [itemId, selectGroup]);
  const deleteCallback = useCallback(() => deleteGroup(itemId), [itemId, deleteGroup]);
  return (
    <div className="flow-initial">
      <div className="flex items-center">
        <div className="flex-1 py-2" onClick={selectCallback}>
          {itemName}
        </div>
        {isSystem ? (
          ""
        ) : (
          <Button className="flex-initial" onClick={deleteCallback}>
            x
          </Button>
        )}
      </div>
    </div>
  );
};
