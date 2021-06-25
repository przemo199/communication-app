import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainPage from "./page/MainPage";
import ErrorPage from "./page/ErrorPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState<string>("mainPage");

  switch (currentPage) {
    case "mainPage":
      return (
        <>
          <MainPage setCurrentPage={setCurrentPage} />
        </>
      );
    default:
      return (
        <>
          <ErrorPage setCurrentPage={setCurrentPage} />
        </>
      );
  }
};

export default App;
