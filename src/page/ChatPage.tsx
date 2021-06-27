import React, { Dispatch, SetStateAction, useState, useRef } from "react";
import Clock from "../components/ClockHook";
import Peer from "peerjs";

const ChatPage = ({
  setCurrentPage,
  currentRoom,
  peer,
  conn,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  currentRoom: string | null;
  peer: Peer;
  conn: Peer.DataConnection | undefined;
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  conn?.on("data", (data) => {
    if (null !== chatRef.current) {
      let childNode = document.createElement("p");
      let date = new Date();
      childNode.textContent =
        "(Someone Else) (" + date.toLocaleTimeString() + ") " + data;
      setInputMessage("");
      chatRef.current.appendChild(childNode);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (null !== chatRef.current) {
      let childNode = document.createElement("p");
      let date = new Date();
      childNode.textContent =
        "(You) (" + date.toLocaleTimeString() + ") " + inputMessage;
      setInputMessage("");
      chatRef.current.appendChild(childNode);
      conn?.send(inputMessage);
    }
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <section className="top-bar">
            <button onClick={() => setCurrentPage("mainPage")}>Home</button>
            <Clock />
            <h2>Room {currentRoom}</h2>
          </section>
          <section className="main">
            <div className="peopleList"></div>
            <div className="chat-main">
              <div className="chat" ref={chatRef}></div>
              <div className="input">
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Enter Message Here"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                    }}
                  />
                </form>
              </div>
            </div>
          </section>
        </header>
      </div>
    </>
  );
};

export default ChatPage;
