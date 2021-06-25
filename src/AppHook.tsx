import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainPage from "./page/MainPage";
import ErrorPage from "./page/ErrorPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState<string>("mainPage");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  switch (currentPage) {
    case "mainPage":
      return (
        <>
          <MainPage
            setCurrentPage={setCurrentPage}
            setCurrentRoom={setCurrentRoom}
          />
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
