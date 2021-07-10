import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {Button, Form} from "react-bootstrap";
import Clock from "../components/ClockHook";
import Peer from "peerjs";
import crc32 from "crc-32";
import "./ChatPage.css";

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720
  }
}

const ChatPage = ({
  setCurrentPage,
  currentRoom,
  create
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>,
  currentRoom: string,
  create: boolean
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [connList, setConnList] = useState<Peer.DataConnection[]>([]);
  const [peerIDList, setPeerIDList] = useState<string[]>([]);
  let [peer, setPeer] = useState<Peer>(new Peer({debug: 3}));
  const [yourID, setYourID] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [incomingMediaStream, setIncomingMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    peer.disconnect();
    let tempPeer = new Peer(create ? currentRoom : undefined, {debug: 3});
    setPeer(tempPeer);
    peer = tempPeer;
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
            content: "Connection Open"
          })
        );

        addConn(conn);

        conn.send(
          JSON.stringify({
            sender: peer.id,
            type: "peerIDList",
            content: peerIDList
          })
        );
      });

      conn.on("close", () => {
        console.log("Connection closed: " + conn.label);
      });

      conn.on("disconnected", () => {
        console.log("Connection interrupted: " + conn.label);
      });

      conn.on("error", (e) => {
        console.error(e);
      });
    });

    peer.on("call", (call) => {
      console.log("media printed");
      console.log(mediaStream ? mediaStream.id : undefined);
      call.answer(mediaStream ? mediaStream : undefined);
      call.on("stream", (stream: MediaStream) => {
        console.log("stream event")
        if (remoteVideoRef.current) {
          console.log("stream set")
          remoteVideoRef.current.srcObject = stream;
        } else {
          console.log("no video element")
        }
      });
    });

    return () => {
      peer.destroy();
    }
  }, []);

  useEffect(() => {
    if (!mediaStream) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setMediaStream(stream);
        } catch (e) {
          console.error(e)
        }
        console.log("done")
      })();
    }

    if (mediaStream && localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
      if (!create) {
        console.log("mediaPrint")
        console.log(mediaStream);
        const call = peer.call(currentRoom, mediaStream);
        console.log("calling")
        call.on("stream", (stream) => {
          console.log("stream event")
          if (remoteVideoRef.current) {
            console.log("stream set")
            remoteVideoRef.current.srcObject = stream;
          } else {
            console.log("no video element")
          }
        });
      }
    }
  }, [peer, localVideoRef, mediaStream]);

  const addConn = (newConnection: Peer.DataConnection) => {
    connList.push(newConnection);
    peerIDList.push(newConnection.peer);
    setPeerIDList([...peerIDList]);
  };

  const connectToPeer = (peerID: string, tempPeer: Peer) => {
    const conn = tempPeer.connect(peerID);
    try {
      conn.on("open", () => {
        addConn(conn);
        conn.send(
          JSON.stringify({
            sender: tempPeer.id,
            type: "connection",
            content: "Connection Open"
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
        message.content.forEach((peerID: string) => {
          if (peerID !== peer.id && peerIDList.indexOf(peerID) === -1) {
            connectToPeer(peerID, peer);
          }
        });
    }
  };

  const appendMessage = (data: any) => {
    if (chatRef.current) {
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
        title.style.backgroundColor = `#${colourNum.slice(1, 7)}`;
        divNode.appendChild(title);
        divNode.appendChild(textNode);
        chatRef.current.appendChild(divNode);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      appendMessage({sender: "You", content: inputMessage});
      connList.forEach((connection) => {
        connection.send(
          JSON.stringify({
            sender: peer.id,
            type: "message",
            content: inputMessage
          })
        );
      });
    }
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
      <header className="Chat-window">
        <section className="top-bar">
          <Button onClick={() => goHome()}>Home</Button>
          <h2 className="YourID">{peer.id ? "Your ID: " +  yourID : "Connecting..."}</h2>
          <Clock/>
        </section>
        <video className="vid" ref={localVideoRef} autoPlay/>
        <video className="vid" ref={remoteVideoRef} autoPlay/>
        <section className="main">
          <div className="peopleList"/>
          <div className="chat-main">
            <div className="chat" ref={chatRef}/>
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
              return (
                <p
                  className="user"
                  style={{
                    backgroundColor: colour
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
