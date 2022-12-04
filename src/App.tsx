import "./App.scss";
import logo from "./assets/logo.svg";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Project from "./pages/Project/Project";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "./components/Loader/Loader";

function App() {
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
      window.onload = () => {
        setIsloading(false);
      };
  }, []);

  return (
    <div className="app">
      {isLoading ? <Loader /> : ""}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<Project />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
