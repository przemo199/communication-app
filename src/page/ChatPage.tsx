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
import crc32 from "crc-32";
import "./ChatPage.css";

const ChatPage = ({
  setCurrentPage,
  currentRoom,
  create,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  currentRoom: string;
  create: boolean;
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const [connList, setConnList] = useState<Peer.DataConnection[]>([]);
  const [peerIDList, setPeerIDList] = useState<string[]>([]);
  const [peer, setPeer] = useState<Peer>(new Peer());
  const [yourID, setYourID] = useState("");

  useEffect(() => {
    let tempPeer = new Peer();
    setPeer(tempPeer);
    peer.on("open", (id) => {
      setYourID(id);
      if (!create) {
        connectToPeer(currentRoom, peer);
      }
    });

    peer.on("connection", (conn) => {
      conn.on("data", (data) => {
        handleData(data);
      });
      conn.on("open", () => {
        conn.send(
          JSON.stringify({
            sender: peer.id,
            type: "connection",
            content: "Connection Open",
          })
        );
        addConn(conn);
        conn.send(
          JSON.stringify({
            sender: peer.id,
            type: "peerIDList",
            content: peerIDList,
          })
        );
      });
    });
  }, []);

  const addConn = (newConnection: Peer.DataConnection) => {
    connList.push(newConnection);
    peerIDList.push(newConnection.peer);
    setPeerIDList([...peerIDList]);
    console.log(peerIDList);
  };

  const connectToPeer = (peerID: string, tempPeer: Peer) => {
    console.log(peerID);
    console.log(peer.id);
    console.log(tempPeer.id);
    var conn = tempPeer.connect(peerID);
    try {
      conn.on("open", () => {
        addConn(conn);
        conn.send(
          JSON.stringify({
            sender: tempPeer.id,
            type: "connection",
            content: "Connection Open",
          })
        );
      });
      conn.on("data", (data) => {
        handleData(data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleData = (data: any) => {
    let message = JSON.parse(data);
    switch (message.type) {
      case "message":
        appendMessage(message);
        break;
      case "connection":
        console.log(`[Connection] ${message.content}`);
        break;
      case "peerIDList":
        message.content.map((peerID: string) => {
          if (peerID !== peer.id && peerIDList.indexOf(peerID) === -1) {
            connectToPeer(peerID, peer);
          }
          return null;
        });
    }
  };

  const appendMessage = (data: any) => {
    if (chatRef.current !== null) {
      let textNode = document.createElement("p");
      let date = new Date();
      textNode.textContent =
        data.sender === "You"
          ? data.content + " (" + date.toLocaleTimeString() + ") "
          : " (" + date.toLocaleTimeString() + ") " + data.content;
      let lastMessage =
        chatRef.current.children[chatRef.current.children.length - 1];
      let lastTitle;
      if (lastMessage) {
        lastTitle = lastMessage.children[0];
      }
      if (lastTitle && lastTitle.getAttribute("sender") === data.sender) {
        chatRef.current.children[
          chatRef.current.children.length - 1
        ].appendChild(textNode);
      } else {
        let divNode = document.createElement("section");
        divNode.classList.add(data.sender === "You" ? "you" : "foreign");
        let title = document.createElement("p");
        title.setAttribute("sender", data.sender);
        title.classList.add("title");
        title.textContent = data.sender;
        let colourNum = `${crc32.str(data.sender).toString(16)}`;
        colourNum = colourNum.padEnd(7, "0");
        let colour = `#${colourNum.slice(1, 7)}`;
        title.style.backgroundColor = colour;
        divNode.appendChild(title);
        divNode.appendChild(textNode);
        chatRef.current.appendChild(divNode);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    appendMessage({ sender: "You", content: inputMessage });
    connList.map((connection) => {
      connection.send(
        JSON.stringify({
          sender: peer.id,
          type: "message",
          content: inputMessage,
        })
      );
      return null;
    });
    setInputMessage("");
  };

  const goHome = () => {
    peer.destroy();
    setConnList([]);
    setPeerIDList([]);
    setCurrentPage("mainPage");
  };

  return (
    <div className="App">
      <header className="App-header">
        <section className="top-bar">
          <Button onClick={() => goHome()}>Home</Button>
          <Clock />
        </section>
        <h2 className="YourID">Your ID: {yourID}</h2>
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
          <div className="user-list">
            {peerIDList.map((peerID) => {
              let colourNum = `${crc32.str(peerID).toString(16)}`;
              colourNum = colourNum.padEnd(7, "0");
              let colour = `#${colourNum.slice(1, 7)}`;
              console.log(colour);
              console.log("=====");
              console.log(colourNum);
              return (
                <p
                  className="user"
                  style={{
                    backgroundColor: colour,
                  }}
                  key={peerID}
                >
                  {peerID}
                </p>
              );
            })}
          </div>
        </section>
      </header>
    </div>
  );
};

export default ChatPage;
