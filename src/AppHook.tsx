import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MainPage from "./page/MainPage";
import ErrorPage from "./page/ErrorPage";
import ChatPage from "./page/ChatPage";
import PeerPage from "./page/PeerPage";
import Peer from "peerjs";

const App = () => {
  const [currentPage, setCurrentPage] = useState<string>("peerPage");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer>(new Peer());
  const [conn, setConn] = useState<Peer.DataConnection>();

  switch (currentPage) {
    case "peerPage":
      return <PeerPage setCurrentPage={setCurrentPage} setPeer={setPeer} />;
    case "mainPage":
      return (
        <MainPage
          setCurrentPage={setCurrentPage}
          setCurrentRoom={setCurrentRoom}
          peer={peer}
          conn={conn}
          setConn={setConn}
        />
      );
    case "chatPage":
      return (
        <ChatPage
          setCurrentPage={setCurrentPage}
          currentRoom={currentRoom}
          peer={peer}
          conn={conn}
        />
      );
    default:
      return <ErrorPage setCurrentPage={setCurrentPage} />;
  }
};

export default App;
