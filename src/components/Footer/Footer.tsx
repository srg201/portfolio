import React from "react";
import styles from "./footer.module.scss";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className={styles.wrap}>
      <Link to="/">
        <img src={logo} alt="" width={25} />
      </Link>
      <small>B&nbsp;S&nbsp;Y. &copy;&nbsp;{new Date().getFullYear()}</small>
    </footer>
  );
};

export default Footer;
