import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";

const BLUR = " "; /* blur-sm */

const styles = {
  "left-column": "lg:w-48 space-y-4 pr-8 md:w-24 md:pr-2",
  "messages-layout": "grid-cols-[28px_auto_auto_auto] md:grid-cols-[28px_auto_200px_auto]",
  "messages-clamp": "lg:line-clamp-2 line-clamp-4",
  "messages-from-text-wrap": "md:flex-wrap",
  "messages-date": "hidden md:block",
  "messages-group-dropdown-name": "hidden sm:inline",
};

export const ChannelNav = ({ channels, onSelect }) => {
  const buttons = channels.map((e) => <Channel key={e.id} channelType={e.channelType} id={e.id} onClick={onSelect} />);

  const { t } = useTranslation();

  return (
    <div className="flex">
      <ul className={`flex-column space-y ${styles["left-column"]}`}>
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

export const MessageList = ({ messages, groups, setGroup, hide }) => {
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
      body={e.body}
      hide={hide}
    />
  ));
  return <div className={`grid border-4 border-menu gap-y-1 ${styles["messages-layout"]}`}>{items}</div>;
};

const Select = ({ options, selected, callback }) => {
  const find = () => {
    const found = options.find((e) => e[0] === selected);
    if (found) {
      return found[1];
    } else if (options) {
      return options[0][1];
    } else {
      return "";
    }
  };

  const [selectedText, setSelectedText] = useState(find());

  const selectItems = options.map(([v, txt]) => (
    <Dropdown.Item eventKey={[v, txt]} key={`message-item-${v}-${txt}`} active={selectedText === txt}>
      {txt}
    </Dropdown.Item>
  ));

  return (
    <Dropdown
      onSelect={(key, _) => {
        const [v, txt] = key.split(",", 2);
        setSelectedText(txt);
        callback(v);
      }}
    >
      <Dropdown.Toggle variant="skimmer">
        <span className={styles["messages-group-dropdown-name"]}>{selectedText}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu variant="skimmer">{selectItems}</Dropdown.Menu>
    </Dropdown>
  );
};

const Item = ({ id, body, from, subject, sent, groups, setGroup, groupId, hide }) => {
  const localDate = new Date(sent).toLocaleString("en-US").replace(",", " ");

  return (
    <>
      <div
        data-message-id={id}
        className="py-2 pr-2 bg-menu"
        onClick={(e) => {
          for (const n of e.currentTarget.parentNode.querySelectorAll(`[data-message-id='${id}']`)) {
            n.style.display = "none";
          }
          hide([id]);
        }}
      >
        <GoogleLogo />
      </div>
      <div
        data-message-id={id}
        className={`p-2 overflow-hidden bg-menu ${BLUR} flex flex-row ${styles["messages-from-text-wrap"]}`}
      >
        <div className="basis-[100px] shrink-0 text-ellipsis overflow-hidden whitespace-nowrap">{from}</div>
        <div className="basis-[150px] flex-1 overflow-hidden flow-0">
          <div className="text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="font-bold">{subject}</span>
          </div>
          <div className={`text-ellipsis overflow-hidden whitespace-wrap ${styles["messages-clamp"]}`}>{body}</div>
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

const GoogleLogo = () => {
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
        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
      />
    </svg>
  );
};
