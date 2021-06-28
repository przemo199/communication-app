import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Form } from "react-bootstrap";
import Clock from "../components/ClockHook";
import Peer from "peerjs";

const ChatPage = ({
  setCurrentPage,
  currentRoom,
  create,
  peer,
  setPeer,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  currentRoom: string | undefined;
  create: boolean;
  peer: Peer;
  setPeer: Dispatch<SetStateAction<Peer>>;
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const [connList, setConnList] = useState<Peer.DataConnection[]>([]);
  const [peerIDList, setPeerIDList] = useState<string[]>([]);

  const addConn = (newConnection: Peer.DataConnection) => {
    connList.push(newConnection);
    peerIDList.push(newConnection.peer);
  };

  useEffect(() => {
    if (currentRoom) {
      if (create) {
        console.log(peer.id);
        peer.on("connection", (conn) => {
          conn.on("data", (data) => {
            console.log(data);
            handleData(data);
          });
          conn.on("open", () => {
            conn.send("[Connection Open]");
            addConn(conn);
          });
        });
      } else {
        let conn = peer.connect(currentRoom);
        addConn(conn);
        console.log(conn);
        console.log("Connecting");
        if (conn !== undefined) {
          console.log("Defining");
          conn.on("data", (data) => {
            console.log(data);
            handleData(data);
          });
          conn.on("open", () => {
            conn.send("[Connection Open]");
          });
        }
      }
    }
  }, []);

  const handleData = (data: any) => {
    let message = JSON.parse(data);
    switch (message.type) {
      case "message":
        appendDataMessage(message);
        break;
    }
  };

  const appendDataMessage = (data: any) => {
    if (null !== chatRef.current) {
      let childNode = document.createElement("p");
      let date = new Date();
      childNode.textContent =
        "(" +
        data.sender +
        ") (" +
        date.toLocaleTimeString() +
        ") " +
        data.content;
      setInputMessage("");
      chatRef.current.appendChild(childNode);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (null !== chatRef.current) {
      let childNode = document.createElement("p");
      let date = new Date();
      childNode.textContent =
        "(You) (" + date.toLocaleTimeString() + ") " + inputMessage;
      setInputMessage("");
      chatRef.current.appendChild(childNode);
      connList.map((connection) => {
        console.log(connection);
        connection.send(
          JSON.stringify({
            sender: peer.id,
            type: "message",
            content: inputMessage,
          })
        );
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <section className="top-bar">
          <Button onClick={() => setCurrentPage("mainPage")}>Home</Button>
          <Clock />
          <h2>Room ID: {peer.id}</h2>
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
                />
                <Button variant="primary" type="submit">
                  ➤
                </Button>
              </form>
            </div>
          </div>
        </section>
      </header>
    </div>
  );
};

export default ChatPage;
