import React, { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import Clock from "../components/ClockHook";
import Peer, { DataConnection } from "peerjs";
import crc32 from "crc-32";
import Video from "../components/Video";
import "./ChatPage.css";

interface ChatProps {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  currentRoom: string;
  create: boolean;
}

interface ChatState {
  peer: Peer;
  conns: DataConnection[];
  message: string;
  messages: MessageSection[];
  mediaStream: MediaStream | null;
  remoteStreams: MediaStream[];
}

interface MessageSection {
  sender: string;
  backGroundColour: string;
  messages: Message[];
}

interface Message {
  time: string;
  message: string;
}

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720,
  },
};

const peerSettings = {
  host: "/",
  path: "/peerjs",
  port: 3001,
};

export default class ChatPage extends React.Component<ChatProps, ChatState> {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>[];
  chatRef: React.RefObject<HTMLDivElement>;
  messageNotification: HTMLAudioElement;

  constructor(props: ChatProps) {
    super(props);
    this.state = {
      peer: new Peer(
        props.create ? props.currentRoom : undefined,
        peerSettings
      ),
      conns: [],
      message: "",
      messages: [],
      mediaStream: null,
      remoteStreams: [],
    };
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = [];
    this.chatRef = React.createRef();
    this.messageNotification = new Audio("/message-notification.mp3");
  }

  componentDidMount() {
    this.state.peer.on("connection", (conn) => {
      this.defineConnectionBehaviour(conn);
    });

    this.state.peer.on("close", () => {
      console.log("Peer closed");
    });

    this.state.peer.on("disconnected", () => {
      console.log("Peer disconnected");
    });

    this.state.peer.on("open", () => {
      if (!this.props.create) {
        let conn = this.state.peer.connect(this.props.currentRoom);
        this.defineConnectionBehaviour(conn);
      }
    });

    this.state.peer.on("call", (call) => {
      call.answer(this.state.mediaStream || undefined);
      call.on("stream", (stream) => {
        console.log("stream received (in mount)");
        this.setState({ remoteStreams: [...this.state.remoteStreams, stream] });
      });
      call.on("close", () => {});
    });

    this.getMediaStream();
  }

  componentWillUnmount() {
    Object.keys(this.state.peer.connections).forEach((key) =>
      this.state.peer.connections[key].close()
    );
    // this.state.conns.forEach(conn => conn.close());
    this.state.peer.destroy();
  }

  getMediaStream = () => {
    if (!this.state.mediaStream) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.setState({ mediaStream: stream }, () => {
            if (this.localVideoRef.current) {
              this.localVideoRef.current.srcObject = this.state.mediaStream;
            }

            if (!this.props.create) {
              Object.keys(this.state.peer.connections).forEach(
                (conn: string) => {
                  console.log("calling: " + conn);
                  let call = this.state.peer.call(
                    conn,
                    this.state.mediaStream!
                  );
                  call.on("stream", (str) => {
                    console.log("stream received");
                    this.remoteVideoRef.push(React.createRef());
                    let ref =
                      this.remoteVideoRef[this.remoteVideoRef.length - 1];
                    if (ref.current) {
                      ref.current.srcObject = str;
                    }
                  });
                }
              );
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  defineConnectionBehaviour = (conn: Peer.DataConnection) => {
    this.setState({ conns: [...this.state.conns, conn] }, () => {
      conn.on("open", () => {
        conn.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "connection",
            content: "Connection Open",
          })
        );

        conn.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "peerIDList",
            content: this.state.conns.map((connection) => connection.peer),
          })
        );
      });
    });

    conn.on("data", (data) => {
      this.handleData(data);
    });

    conn.on("close", () => {
      this.setState({
        conns: this.state.conns.filter(
          (connection) => connection.peer !== conn.peer
        ),
      });
      console.log("Connection closed: " + conn.label);
    });

    conn.on("disconnected", () => {
      console.log("Connection interrupted: " + conn.label);
    });

    conn.on("error", (e) => {
      console.error(e);
    });

    conn.peerConnection.addEventListener("iceconnectionstatechange", (ev) => {
      console.log(conn.peerConnection.iceConnectionState);
      switch (conn.peerConnection.iceConnectionState) {
        case "disconnected": {
          this.setState({
            conns: this.state.conns.filter((connection) => connection !== conn),
          });
          this.appendMessage({
            sender: "Server",
            content: `Lost Connection to ${conn.peer}`,
          });
          break;
        }
        default: {
          break;
        }
      }
    });
  };

  handleData = (data: any) => {
    let message = JSON.parse(data);
    switch (message.type) {
      case "message":
        this.appendMessage(message);
        if (!document.hasFocus()) {
          this.messageNotification.play();
        }
        break;
      case "connection":
        console.log(`[Connection] ${message.content}`);
        break;
      case "peerIDList":
        message.content.forEach((peerID: string) => {
          if (
            peerID !== this.state.peer.id &&
            this.state.conns.map((conn) => conn.peer).indexOf(peerID) === -1
          ) {
            let conn = this.state.peer.connect(peerID);
            this.defineConnectionBehaviour(conn);
          }
        });
        break;
      default:
        console.log("Incorrect data type");
    }
  };

  appendMessage = (data: any) => {
    console.log(data);
    if (this.chatRef.current) {
      let newMessages = this.state.messages;
      let date = new Date();
      let lastMessage = this.state.messages[this.state.messages.length - 1];
      let lastSender;
      if (lastMessage) lastSender = lastMessage.sender;

      if (lastMessage && lastSender === data.sender) {
        let newMessage: Message = {
          time: date.toLocaleTimeString(),
          message: data.content,
        };
        newMessages[newMessages.length - 1].messages.push(newMessage);
      } else {
        let colourNum = `${crc32.str(data.sender).toString(16)}`;
        colourNum = colourNum.padEnd(7, "0");
        let newMessage: Message = {
          time: date.toLocaleTimeString(),
          message: `${data.content}`,
        };
        let newSection: MessageSection = {
          sender: `${data.sender}`,
          backGroundColour: `#${colourNum.slice(1, 7)}`,
          messages: [newMessage],
        };
        newMessages.push(newSection);
      }

      this.setState({ messages: [...newMessages] });
    }
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (this.state.message.trim()) {
      this.appendMessage({
        sender: "You",
        type: "userMessage",
        content: this.state.message,
      });
      this.state.conns.forEach((connection) => {
        connection.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "message",
            content: this.state.message,
          })
        );
      });
    }

    this.setState({ message: "" });
  };

  goHome = () => {
    this.state.peer.destroy();
    this.props.setCurrentPage("mainPage");
  };

  render() {
    return (
      <div className="App">
        <header className="Chat-window">
          <section className="top-bar">
            <Button onClick={() => this.goHome()}>Home</Button>
            <h2 className="YourID">
              {this.state.peer.id
                ? "Your ID: " + this.state.peer.id
                : "Connecting..."}
            </h2>
            <Clock />
          </section>
          <section className="main">
            <div className="peopleList" />
            <div className="chat-main">
              <div className="chat" ref={this.chatRef}>
                {this.state.messages.map((messageSection) => {
                  return (
                    <section
                      className={
                        messageSection.sender === "You"
                          ? "you"
                          : messageSection.sender === "Server"
                          ? "server"
                          : "received"
                      }
                    >
                      <p className="title">
                        <span
                          style={{
                            backgroundColor: messageSection.backGroundColour,
                          }}
                        >
                          {messageSection.sender}
                        </span>
                      </p>
                      {messageSection.messages.map((message) => {
                        return (
                          <p>
                            {messageSection.sender === "You"
                              ? `${message.message} (${message.time})`
                              : `(${message.time}) ${message.message}`}
                          </p>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
              <div className="input">
                <form onSubmit={this.handleSubmit}>
                  <Form.Control
                    type="text"
                    placeholder="Enter Message Here"
                    value={this.state.message}
                    onChange={(e) => {
                      this.setState({ message: e.target.value });
                    }}
                  />
                  <Button variant="primary" type="submit">
                    ➤
                  </Button>
                </form>
              </div>
            </div>
            <div className="user-list">
              {this.state.conns.map((conn) => {
                let colourNum = `${crc32.str(conn.peer).toString(16)}`;
                colourNum = colourNum.padEnd(7, "0");
                let colour = `#${colourNum.slice(1, 7)}`;
                return (
                  <p
                    className="user"
                    style={{ backgroundColor: colour }}
                    key={conn.peer}
                  >
                    {conn.peer}
                  </p>
                );
              })}
            </div>
            <video className="vid" ref={this.localVideoRef} autoPlay muted />
            {this.state.remoteStreams.map((stream) => {
              return (
                <Video
                  srcObject={stream}
                  className="vid"
                  autoPlay={true}
                ></Video>
              );
            })}
          </section>
        </header>
      </div>
    );
  }
}
