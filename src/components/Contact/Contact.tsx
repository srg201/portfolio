import React from 'react';
import styles from './contact.module.scss'

const Contact = () => {
  return (
    <section className={["container", styles.wrap].join(" ")}>
      <h2 className="heading2">Contacts</h2>
      <ul>
        <li>
          <a className="paragraph" target='_blank' href="https://t.me/srg201">
            Telegram
          </a>
        </li>
        <li>
          <a className="paragraph" target='_blank' href="https://github.com/srg201">
            Github
          </a>
        </li>
        <li>
          <a className="paragraph" target='_blank' href="mailto:belakovs628@gmail.com">
            Email
          </a>
        </li>
      </ul>
    </section>
  );
}

export default Contact