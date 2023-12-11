import { Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const ChannelNav = ({ channels, className, onSelect }) => {
  const buttons = channels.map((e) => (
    <Channel key={e.id} channel_type={e.channel_type} id={e.id} onClick={onSelect} />
  ));

  const { t } = useTranslation();

  return (
    <div className="flex">
      <ul className={`flex-column space-y space-y-4 ${className}`}>
        <li>{t("Channels")}</li>
        {buttons}
      </ul>
    </div>
  );
};

const Channel = ({ id, channel_type, onClick }) => {
  const click = useCallback(
    (e) => {
      onClick(e.currentTarget.value);
    },
    [onClick],
  );
  return (
    <li key={id}>
      <Button onClick={click} className="block w-full bg-menu text-left" value={id}>
        <div className="min-w-full">{channel_type}</div>
      </Button>
    </li>
  );
};

export const MessageList = ({ data }) => {
  const contents = data.map((e) => <Item key={`${e.id}`} from={e.from} subject={e.subject} sent={e.sent} />);
  return <div className="bg-menu flex-1 flex flex-col overflow-hidden">{contents}</div>;
};

const Item = ({ id, from, subject, sent }) => {
  const localDate = new Date(sent).toLocaleString("en-US");

  return (
    <div className="flex">
      <div className="flex-0 p-2">
        <input type="checkbox" />
      </div>
      <div className="basis-64 p-2 text-ellipsis overflow-hidden whitespace-nowrap">{from}</div>
      <div className="flex-1 p-2 text-ellipsis overflow-hidden whitespace-nowrap">{subject}</div>
      <div className="basis-64 p-2">{localDate}</div>
    </div>
  );
};
