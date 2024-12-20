import React, { useState, useEffect } from "react";
import Label from "@/components/Label";

function Toggle({ onToggle, defaultState = false, activeColor = "#7466E2", label }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setIsOn(defaultState);
  }, [defaultState]);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div style={styles.container}>
        <Label text={label}></Label>
      <div
        style={{
          ...styles.toggle,
          backgroundColor: isOn ? activeColor : "#ccc",
        }}
        onClick={handleToggle}
      >
        <div
          style={{
            ...styles.knob,
            transform: isOn ? "translateX(30px)" : "translateX(0)",
          }}
        ></div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    alignItems: "left",
    fontFamily: "Arial, sans-serif",
  },
  toggle: {
    width: "50px",
    height: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "left",
    padding: "2.5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    position: "relative",
  },
  knob: {
    width: "15px",
    height: "15px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    transition: "transform 0.3s ease",
  }
};

export default Toggle;
