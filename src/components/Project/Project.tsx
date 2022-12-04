import React from "react";
import styles from "./project.module.scss";
import { Link } from "react-router-dom";

export interface ProjectProps {
  _id: string;
  imgPreview: string;
  title: string;
  categories: string[];
  descr: string;
  link: string;
  images: string[];
}

const Project: React.FC<ProjectProps> = ({
  imgPreview: imagePreview,
  title,
  categories,
  _id,
}) => {
  return (
    <Link to={`/projects/${_id}`} className={styles.wrap}>
      <div>
        <img className={styles.img} src={imagePreview} alt={title} />
      </div>
      <h4 className={styles.title}>{title}</h4>
      <ul className={styles.list}>
        {categories.map((category, idx) => (
          <li key={idx}>
            {category}
            {idx === categories.length - 1 ? "" : " ✳ "}
          </li>
        ))}
      </ul>
    </Link>
  );
};

export default Project;
