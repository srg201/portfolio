import React, {useEffect} from "react";
import Contact from "../../components/Contact/Contact";
import Header from "../../components/Header/Header";
import Projects from "../../components/Projects/Projects";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Header />
      <Projects />
      <Contact />
    </div>
  );
};

export default Home;
