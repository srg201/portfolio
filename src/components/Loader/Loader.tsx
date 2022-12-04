import React from "react";
import styles from "./loader.module.scss";
import logo from "../../assets/logo.svg";

const Loader = () => {
  return (
    <div className={styles.wrap}>
      <img src={logo} alt="Loading..." />
    </div>
  );
};

export default Loader;
