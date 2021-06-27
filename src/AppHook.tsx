import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainPage from "./page/MainPage";
import ErrorPage from "./page/ErrorPage";
import ChatPage from "./page/ChatPage";
import Peer from "peerjs";

const App = () => {
  const [currentPage, setCurrentPage] = useState<string>("mainPage");
  const [currentRoom, setCurrentRoom] = useState<string | undefined>();
  const [create, setCreate] = useState(false);
  const [peer, setPeer] = useState<Peer>(new Peer());

  switch (currentPage) {
    case "mainPage":
      return (
        <MainPage
          setCurrentPage={setCurrentPage}
          setCurrentRoom={setCurrentRoom}
          setCreate={setCreate}
        />
      );
    case "chatPage":
      return (
        <ChatPage
          setCurrentPage={setCurrentPage}
          currentRoom={currentRoom}
          create={create}
          peer={peer}
          setPeer={setPeer}
        />
      );
    default:
      return <ErrorPage setCurrentPage={setCurrentPage} />;
  }
};

export default App;
