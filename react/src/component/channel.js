import { Button } from "flowbite-react";
import { useTranslation } from "react-i18next";

export const ChannelNav = (props) => {
  const buttons = props.channels.map((e) => (
    <Channel key={e.id} name={e.name} id={e.id} />
  ));
  const { t } = useTranslation();

  return (
    <div className="flex">
      <ul className={`flex-column space-y space-y-4 ${props.className}`}>
        <li>{t("Channels")}</li>
        {buttons}
      </ul>
    </div>
  );
};

const Channel = (props) => {
  return (
    <li>
      <Button className="block w-full bg-menu text-left" value="{props.id}">
        <div className="min-w-full">{props.name}</div>
      </Button>
    </li>
  );
};
