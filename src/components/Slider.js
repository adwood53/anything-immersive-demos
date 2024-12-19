import React, { useState } from "react";
import Label from "@/components/Label";
import sliderStyles from './Slider.module.css'; // Assuming your CSS is in this file

const Slider = ({ onValueChanged, minValue = 0, maxValue = 1, defaultValue = 0.5, step = 0.1, label = "Label" }) => {
  const [value, setValue] = useState(defaultValue); // Default value

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onValueChanged) {
      onValueChanged(newValue);
    }
  };

  return (
    <div style={styles.container}>
      <Label text={`${label} ${value}`} />
      <input
        type="range"
        min={minValue}
        max={maxValue}
        step={step}
        value={value}
        onChange={handleChange}
        className={sliderStyles.slider} // Apply the class from CSS
      />
    </div>
  );
};

const styles = {
  container: {
    padding: "10px",
    gap: "5px",
    display: "flex",
    flexDirection: "column",
  },
};

export default Slider;
