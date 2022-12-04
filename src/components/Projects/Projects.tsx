import React, { useEffect, useState } from "react";
import Project, { ProjectProps } from "../Project/Project";
import styles from "./projects.module.scss";
import axios from 'axios';
import Loader from "../Loader/Loader";

const Projects = () => {
  const [data, setData] = useState<ProjectProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axios.get<ProjectProps[]>(
        "http://localhost:4444/projects"
      );

      setData(data);
      setLoading(false)
    } catch (error) {
      setError(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, [])


  if (loading) {
    return <Loader />
  }

  return (
    <div className={"container " + styles.projects}>
      <div className={styles.wrap}>
        {error ? (
          <span>Произошла ошибка получения проектов!</span>
        ) : (
          data.map((project) => <Project key={project._id} {...project} />)
        )}
      </div>
    </div>
  );
};

export default Projects;
