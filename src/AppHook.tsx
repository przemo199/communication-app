import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainPage from "./page/MainPage";
import ErrorPage from "./page/ErrorPage";
import ChatPage from "./page/ChatPage";

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
    case "chatPage":
      return (
        <>
          <ChatPage setCurrentPage={setCurrentPage} currentRoom={currentRoom} />
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
