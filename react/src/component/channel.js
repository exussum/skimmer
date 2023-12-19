import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const ChannelNav = ({ channels, className, onSelect }) => {
  const buttons = channels.map((e) => <Channel key={e.id} channelType={e.channelType} id={e.id} onClick={onSelect} />);

  const { t } = useTranslation();

  return (
    <div className="flex">
      <ul className={`flex-column space-y space-y-4 ${className}`}>
        <li>{t("Channels Title")}</li>
        {buttons}
      </ul>
    </div>
  );
};

const Channel = ({ id, channelType, onClick }) => {
  const click = useCallback(
    (e) => {
      onClick(e.currentTarget.value);
    },
    [onClick],
  );
  return (
    <li key={id}>
      <Button onClick={click} variant="skimmer" className="block w-full text-left" value={id}>
        <div className="min-w-full">{channelType}</div>
      </Button>
    </li>
  );
};

export const MessageList = ({ messages, groups, setGroup }) => {
  const items = messages.map((e) => (
    <Item
      groups={groups}
      key={e.id}
      from={e.from}
      subject={e.subject}
      sent={e.sent}
      setGroup={setGroup}
      id={e.id}
      groupId={e.groupId}
    />
  ));
  return <div className="px-2 bg-menu flex-1 flex flex-col overflow-hidden">{items}</div>;
};

const Item = ({ id, from, subject, sent, groups, setGroup, groupId }) => {
  const localDate = new Date(sent).toLocaleString("en-US");

  const selectItems = groups.map((e) => (
    <option value={e.id} key={e.id}>
      {e.name}
    </option>
  ));

  return (
    <div className="flex">
      <div className="basis-64 py-2 pr-2 text-ellipsis overflow-hidden whitespace-nowrap">{from}</div>
      <div className="flex-1 p-2 text-ellipsis overflow-hidden whitespace-nowrap">{subject}</div>
      <div className="basis-64 p-2">{localDate}</div>
      <select className="bg-menu py-2 p-2" onChange={(e) => setGroup(e.target.value, [id])} value={groupId}>
        {selectItems}
      </select>
    </div>
  );
};
