import { useRef, useEffect, useCallback } from "react";

const InPlaceModal = ({ setVisible, children, visible }) => {
  const dropDownRef = useRef(null);

  const dismiss = useCallback(
    (e) => {
      setVisible(dropDownRef.current.contains(e.target));
    },
    [dropDownRef, setVisible],
  );

  useEffect(() => {
    document.body.addEventListener("click", dismiss);
    return () => {
      document.body.removeEventListener("click", dismiss);
    };
  }, [dismiss]);

  return (
    <div ref={dropDownRef}>
      <div className={`relative ${visible ? "" : "hidden"} w-min`}>
        <div className="absolute">{children}</div>
      </div>
    </div>
  );
};

export default InPlaceModal;
