const Label = ({text}) => {
  return (
    <span style={styles.valueDisplay}>{text}</span>
  );
}

const styles = {
  valueDisplay: {
    fontSize: "13px",
    color: "white",
  }
};

export default Label;
