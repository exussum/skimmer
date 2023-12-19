import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";

export const GuestUserWarning = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Modal show={true} onHide={onClick}>
      <Modal.Body>
        <div className="space-y-6">
          <p className="text-base leading-relaxed">{t("Contact the owner to be added")}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const UserMenu = ({ channels, login, onClick, deleteChannel }) => {
  const { t } = useTranslation();

  const channelItems = channels.map((e, i) => {
    return (
      <ChannelItem
        key={`channel-${i}`}
        id={e.id}
        channelType={e.channelType}
        addPath={e.addPath}
        deleteChannel={deleteChannel}
      />
    );
  });

  return (
    <Dropdown>
      <Dropdown.Toggle variant="skimmer">{login}</Dropdown.Toggle>
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

const ChannelItem = ({ id, deleteChannel, addPath, channelType }) => {
  const { t } = useTranslation();
  const action = id ? t("Remove Channel Action") : t("Add Channel Action");
  const onClick = () => {
    if (id) {
      deleteChannel(id);
    } else {
      window.location = addPath;
    }
  };
  return (
    <Dropdown.Item onClick={onClick}>
      {action} {channelType}
    </Dropdown.Item>
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
