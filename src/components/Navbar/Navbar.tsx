import React from "react";
import styles from "./navbar.module.scss";
import logo from "../../assets/logo.svg";
import telegram from "../../assets/telegram.svg";
import mail from "../../assets/mail.svg";
import github from "../../assets/github.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className={styles.wrap}>
      <Link to="/">
        <img src={logo} alt="B S Y." />
      </Link>
      <ul>
        <li>
          <a href="https://t.me/srgg201" target="_blank">
            <img src={telegram} alt="telegram" />
          </a>
        </li>
        <li>
          <a href="https://github.com/srg201" target="_blank">
            <img src={github} alt="github" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
