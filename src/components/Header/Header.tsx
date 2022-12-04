import React from 'react'
import styles from './Header.module.scss'

const Header = () => {
  return (
    <section>
      <div className={["container", styles.wrap].join(" ")}>
        <h1 className={styles.title}>B&nbsp;S&nbsp;Y.</h1>
        <p className="paragraph">
          Hello! My&nbsp;name is&nbsp;Sergey and I&rsquo;m frontend developer.
          I&nbsp;can create website for you using the most popular technologies!
        </p>
      </div>
    </section>
  );
}

export default Header