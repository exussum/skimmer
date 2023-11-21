import { Flowbite, Modal, Dropdown } from "flowbite-react";
import { useTranslation } from "react-i18next";

export const GuestUserWarning = (props) => {
  const { t } = useTranslation();

  const theme = {
    modal: {
      header: {
        title: "text-white",
      },
      body: {
        title: "text-white",
      },
      content: { inner: "bg-popup" },
    },
  };

  return (
    <Flowbite theme={{ theme: theme }}>
      <Modal show={true} onClick={props.onClick}>
        <Modal.Header>Hi!</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed">
              {t("Contact the owner to be added")}
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </Flowbite>
  );
};

export const UserMenu = (props) => {
  const { t } = useTranslation();
  const theme = {
    dropdown: {
      floating: {
        arrow: {
          style: {
            auto: "bg-popup",
          },
        },
        item: {
          container: "bg-menu",
          base: "flex items-center justify-start py-2 px-4 text-sm  w-full hover:bg-popup focus:bg-popup  focus:outline-none",
        },
        style: { auto: "bg-menu text-white" },
      },
    },
  };

  return (
    <Flowbite theme={{ theme: theme }}>
      <Dropdown inline label={props.login}>
        <Dropdown.Item onClick={props.onClick}>
          <div>{t("Logout")}</div>
        </Dropdown.Item>
      </Dropdown>
    </Flowbite>
  );
};

export const GoogleButton = (props) => {
  const { t } = useTranslation();
  return (
    <div className={props.disabled ? "opacity-50" : ""}>
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
        onClick={props.onClick}
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
