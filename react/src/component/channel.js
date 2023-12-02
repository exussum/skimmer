import { Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const ChannelNav = ({ channels, className, onSelect }) => {
  const buttons = channels.map((e) => (
    <Channel
      key={e.id}
      channel_type={e.channel_type}
      id={e.id}
      onClick={onSelect}
    />
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
      <Button
        onClick={click}
        className="block w-full bg-menu text-left"
        value={id}
      >
        <div className="min-w-full">{channel_type}</div>
      </Button>
    </li>
  );
};
