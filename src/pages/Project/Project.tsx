import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { ProjectProps } from "../../components/Project/Project";
import styles from "./project.module.scss";
import axios from "axios";

const Project: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<ProjectProps>({
    _id: '',
    title: "",
    descr: "",
    categories: [],
    link: "",
    imgPreview: "",
    images: [],
  });
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchData = async () => {
    try {
      const { data } = await axios.get<ProjectProps>(
        "http://localhost:4444/projects/" + id
      );

      setProject(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert('Произошла ошибка при получении данных!');
      navigate('/')
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={["container", styles.wrap].join(" ")}>
      <div className={styles.top}>
        <h2 className="heading2">{project.title}</h2>
        <div>
          <ul className={styles.list}>
            {project.categories.map((category, idx) => (
              <li className="paragraph" key={idx}>
                {category}
                {idx === project.categories.length - 1 ? "" : " ✳ "}
              </li>
            ))}
          </ul>
          <p className="paragraph">{project.descr}</p>
          <a target="_blank" className={styles.link} href={project.link}>
            {"Visit " + project.title}
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        {project.images.map((image) => (
          <div>
            <img src={image} alt={project.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Project;
