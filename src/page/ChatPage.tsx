import React, {Dispatch, SetStateAction, useEffect,useRef, useState} from "react";
import Clock from "../components/ClockHook";
import {Button, Form} from "react-bootstrap";
import Peer from "peerjs";

const ChatPage = ({
                    setCurrentPage,
                    currentRoom
                  }: {
  setCurrentPage: Dispatch<SetStateAction<string>>,
  currentRoom: string
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // we need to somehow differentiate between creating room and joining room
    if (true) {
      // here if creating room
      const peer = new Peer(currentRoom);
      peer.on("connection", (connection) => {
        console.log("works");
        connection.on("data", data => {
          console.log("data");
        })
      });
    } else {
      // here if joining
      const peer = new Peer();
      const connection = peer.connect(currentRoom);
      connection.on('open', () => {
        connection.send('Hello');
      });
    }
      const peer = new Peer(currentRoom);
      const connection = peer.connect(currentRoom);
      peer.on("connection", () => {
        console.log("works");
      });
    }

  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (null !== chatRef.current) {
      let childNode = document.createElement("p");
      let date = new Date();
      childNode.textContent =
        "(You) (" + date.toLocaleTimeString() + ") " + inputMessage;
      setInputMessage("");
      chatRef.current.appendChild(childNode);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <section className="top-bar">
          <Button onClick={() => setCurrentPage("mainPage")}>Home</Button>
          <Clock/>
          <h2>Room ID: {currentRoom}</h2>
        </section>
        <section className="main">
          <div className="peopleList"></div>
          <div className="chat-main">
            <div className="chat" ref={chatRef}></div>
            <div className="input">
              <form onSubmit={handleSubmit}>
                <Form.Control
                  type="text"
                  placeholder="Enter Message Here"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                  }}
                /><Button variant="primary" type="submit">➤</Button>
              </form>
            </div>
          </div>
        </section>
      </header>
    </div>
  );
};

export default ChatPage;
