import React from "react";
import Label from "@/components/Label"

function Button({ onClick, label = "Button", style = {} }) {
  return (
    <button style={{ ...styles.button, ...style }} onClick={onClick}>
      <Label text={label}></Label>
    </button>
  );
}

const styles = {
  button: {
    padding: "2.5px 15px",
    backgroundColor: "#E79023",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default Button;
