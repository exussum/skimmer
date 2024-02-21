import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import Select from "./select";
import { useCallback } from "react";
import styles from "../styles";
import { useContext } from "react";
import { AuthContext } from "../api/auth";
import { Acknowledge, MarkRead } from "./icons";

const BLUR = ""; /* blur-sm */

export const ChannelNav = ({ channels, onSelect, messageCounts }) => {
  const buttons = channels.map((e) => (
    <Channel
      key={e.id}
      identity={e.identity}
      channelType={e.channelType}
      messageCount={messageCounts[e.id]}
      id={e.id}
      onClick={onSelect}
    />
  ));

  const { t } = useTranslation();

  return (
    <div className="flex pb-4">
      <ul className={`flex-column space-y ${styles["left-column"]}`}>
        <li>{t("Channels Title")}</li>
        {buttons}
      </ul>
    </div>
  );
};

const Channel = ({ id, channelType, onClick, identity, messageCount }) => {
  const { ctx } = useContext(AuthContext);
  const click = useCallback(
    (e) => {
      onClick(Number(e.currentTarget.value));
    },
    [onClick],
  );
  return (
    <li key={id}>
      <Button
        onClick={click}
        variant="skimmer"
        className={`block w-full text-left ${
          ctx.selectedChannelId === id ? styles["left-column-selected-channel"] : ""
        }`}
        value={id}
      >
        <div className="min-w-full">
          {channelType} {messageCount ? `[${messageCount}]` : ""}
        </div>
        <div className="min-w-full text-xs overflow-hidden text-ellipsis">{identity}</div>
      </Button>
    </li>
  );
};

export const MessageList = ({ messages, groups, setGroup, acknowledge, markRead }) => {
  const items = messages.map((e) => (
    <Item groups={groups} message={e} acknowledge={acknowledge} setGroup={setGroup} markRead={markRead} />
  ));
  return <div className={`grid border-4 border-menu gap-y-1 ${styles["messages-layout"]}`}>{items}</div>;
};

const Item = ({ message, setGroup, groups, acknowledge, markRead }) => {
  const { from, subject, sent, id, groupId, body } = message;

  const localDate = new Date(sent).toLocaleString("en-US").replace(",", " ");
  const hideRow = (e, id) => {
    for (const n of e.currentTarget.parentNode.querySelectorAll(`[data-message-id='${id}']`)) {
      n.style.display = "none";
    }
  };

  return (
    <>
      <div
        data-message-id={id}
        className="py-2 pr-2 bg-menu"
        onClick={(e) => {
          hideRow(e, id);
          acknowledge(id);
        }}
      >
        <Acknowledge />
      </div>
      <div
        data-message-id={id}
        className="py-2 pr-2 bg-menu"
        onClick={(e) => {
          hideRow(e, id);
          markRead(id);
        }}
      >
        <MarkRead />
      </div>

      <div
        data-message-id={id}
        className={`p-2 overflow-hidden bg-menu flex flex-row ${styles["messages-from-text-wrap"]}`}
      >
        <div className="basis-[100px] shrink-0 text-ellipsis overflow-hidden whitespace-nowrap">{from}</div>
        <div className="basis-[150px] flex-1 overflow-hidden flow-0">
          <div className={`${BLUR} text-ellipsis overflow-hidden whitespace-nowrap font-bold`}>{subject}</div>
          <div className={`${BLUR} text-ellipsis overflow-hidden whitespace-wrap ${styles["messages-clamp"]}`}>
            {body}
          </div>
        </div>
      </div>
      <div data-message-id={id} className="bg-menu p-2">
        <span className={styles["messages-date"]}>{localDate}</span>
      </div>
      <div className="bg-menu py-2 p-2" data-message-id={id}>
        <Select options={groups.map((e) => [e.id, e.name])} selected={groupId} callback={(v) => setGroup(v, [id])} />
      </div>
    </>
  );
};
