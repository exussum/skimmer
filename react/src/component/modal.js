import { useRef, useEffect, useCallback } from "react";

const InPlaceModal = (props) => {
  const dropDownRef = useRef(null);

  const dismiss = useCallback(
    (e) => {
      props.setVisible(dropDownRef.current.contains(e.target));
    },
    [dropDownRef, props],
  );

  useEffect(() => {
    document.body.addEventListener("click", dismiss);
    return () => {
      document.body.removeEventListener("click", dismiss);
    };
  }, [dismiss]);

  return (
    <div ref={dropDownRef}>
      <div className={`relative ${props.visible ? "" : "hidden"} w-min`}>
        <div className="absolute">{props.children}</div>
      </div>
    </div>
  );
};

export default InPlaceModal;
