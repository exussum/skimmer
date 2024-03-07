import { useTranslation } from "react-i18next";
import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Dropdown from "react-bootstrap/Dropdown";
import styles from "../styles";

export const GuestUserWarning = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Modal show={true} onHide={onClick}>
      <Modal.Header closeButton className="bg-popup dialog-header">
        <Modal.Title>{t("Error Alert")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-popup">
        <div className="space-y-6">
          <p className="text-base leading-relaxed">{t("Contact the owner to be added")}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const UserMenu = ({ channels, login, onClick, deleteChannel }) => {
  const { t } = useTranslation();

  const channelItems = channels
    .sort()
    .sort((a, b) => (a.id >= b.id ? 1 : -1))
    .map((e, i) => {
      return (
        <ChannelItem
          key={`channel-${i}`}
          id={e.id}
          channelType={e.channelType}
          channelName={e.channelName}
          addPath={e.addPath}
          deleteChannel={deleteChannel}
          identity={e.identity}
        />
      );
    });

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle variant="skimmer">
        <span className={`${styles["menu-user-hamburger"]}`}>&#9776;</span>
        <span className={`${styles["menu-user-email"]}`}>{login}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu variant="skimmer">
        {channelItems}
        <Dropdown.Divider />
        <Dropdown.Item key="logout" onClick={onClick}>
          <div>{t("Logout")}</div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const ChannelItem = ({ id, deleteChannel, addPath, channelType, identity }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  if (!id) {
    return (
      <Dropdown.Item onClick={() => (window.location = addPath)}>
        {t("Add Channel Action")} {channelType}
      </Dropdown.Item>
    );
  } else {
    return (
      <Dropdown.Item onClick={() => setShow(true)}>
        {t("Remove Channel Action")} {channelType} [{identity}]
        <DeleteConfirmation deleteChannel={() => deleteChannel(id)} show={show} setShow={setShow} />
      </Dropdown.Item>
    );
  }
};

const DeleteConfirmation = ({ deleteChannel, show, setShow }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} variant="skimmer">
      <Modal.Header>
        <Modal.Title>Delete Channel?</Modal.Title>
        {/* Using react-bootstrap's close button via Modal.Header eats the event needed to stop propogating */}
        <CloseButton
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
          }}
        />
      </Modal.Header>

      <Modal.Body>
        <p>Deleting channel will remove all messages, and lose categorisation for this channel. Continue?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="skimmer"
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
          }}
        >
          Close
        </Button>
        <Button variant="skimmer-danger" onClick={deleteChannel}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const GoogleButton = ({ onClick, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
        onClick={onClick}
      >
        <svg
          className="w-4 h-4 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 19"
        >
          <path
            fillRule="evenodd"
            d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
            clipRule="evenodd"
          />
        </svg>
        <div>{t("Sign in with Google")}</div>
      </button>
    </div>
  );
};
