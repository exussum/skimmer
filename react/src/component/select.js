import Dropdown from "react-bootstrap/Dropdown";
import { useState } from "react";
import styles from "../styles";

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

export default Select;
