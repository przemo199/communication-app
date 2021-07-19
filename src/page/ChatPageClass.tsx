import React, { Dispatch, SetStateAction } from "react";
import { Button, Form } from "react-bootstrap";
import Clock from "../components/ClockHook";
import Peer, { DataConnection } from "peerjs";
import crc32 from "crc-32";
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
  messages: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >[];
  mediaStream: MediaStream | null;
  remoteStreams: MediaStream[];
}

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720,
  },
};

const peerSettings = {
  debug: 3,
  host: "/",
  path: "/peerjs",
};

export default class ChatPage extends React.Component<ChatProps, ChatState> {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  messageNotification: HTMLAudioElement;

  constructor(props: ChatProps) {
    super(props);
    this.state = {
      peer: props.create
        ? new Peer(props.currentRoom, peerSettings)
        : new Peer(peerSettings),
      conns: [],
      message: "",
      messages: [],
      mediaStream: null,
      remoteStreams: [],
    };
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.messageNotification = new Audio("/message-notification.mp3");
  }

  componentDidMount() {
    this.state.peer.on("connection", (conn) => {
      this.setState({ conns: [...this.state.conns, conn] }, () => {
        conn.on("data", (data) => {
          this.handleData(data);
        });

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

        conn.peerConnection.addEventListener(
          "iceconnectionstatechange",
          (ev) => {
            switch (conn.peerConnection.iceConnectionState) {
              case "disconnected": {
                this.setState({
                  conns: this.state.conns.filter(
                    (connection) => connection !== conn
                  ),
                });
                this.appendMessage({
                  sender: "You",
                  content: (
                    <p>
                      <em>[Client] Lost Connection to ${conn}</em>
                    </p>
                  ),
                });
                break;
              }
              default: {
                break;
              }
            }
          }
        );
      });
    });

    this.state.peer.on("open", () => {
      if (!this.props.create) {
        this.connectToPeer(this.props.currentRoom);
      }
    });

    this.state.peer.on("call", (call) => {
      call.answer(this.state.mediaStream || undefined);
      call.on("stream", (stream) => {
        console.log("stream received (in mount)");
        if (this.remoteVideoRef.current) {
          this.remoteVideoRef.current.srcObject = stream;
        }
      });
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
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        this.setState({ mediaStream: stream }, () => {
          if (this.localVideoRef.current) {
            this.localVideoRef.current.srcObject = this.state.mediaStream;
          }

          // if (!this.props.create) {
          //   console.log("calling");
          //   let call = this.state.peer.call(this.props.currentRoom, this.state.mediaStream!);
          //   call.on("stream", str => {
          //     console.log("stream received");
          //     if (this.remoteVideoRef.current) {
          //       this.remoteVideoRef.current.srcObject = str;
          //     }
          //   });
          // }
          if (!this.props.create) {
            Object.keys(this.state.peer.connections).forEach((conn: string) => {
              console.log("calling: " + conn);
              let call = this.state.peer.call(conn, this.state.mediaStream!);
              call.on("stream", (str) => {
                console.log("stream received");
                if (this.remoteVideoRef.current) {
                  this.remoteVideoRef.current.srcObject = str;
                }
              });
            });
          }
        });
      });
    }
  };

  connectToPeer = (peerID: string) => {
    const conn = this.state.peer.connect(peerID);
    conn.on("open", () => {
      this.setState({ conns: [...this.state.conns, conn] }, () => {
        conn.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "connection",
            content: "Connection Open",
          })
        );
      });

      conn.on("data", (data) => {
        this.handleData(data);
      });
    });
  };

  handleData = (data: any) => {
    let message = JSON.parse(data);
    switch (message.type) {
      case "message":
        this.appendMessage(message);
        this.messageNotification.play();
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
            this.connectToPeer(peerID);
          }
        });
        break;
      default:
        console.log("Incorrect data type");
    }
  };

  appendMessage = (data: any) => {
    this.setState({
      messages: [
        ...this.state.messages,
        <p className={data.sender === "You" ? "you" : "received"}>
          {data.content}
        </p>,
      ],
    });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (this.state.message.trim()) {
      this.appendMessage({ sender: "You", content: this.state.message });
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
    console.log("rendering");
    console.log(this.state.peer.id);
    console.log(this.state.peer.connections);
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
          <video className="vid" ref={this.localVideoRef} autoPlay muted />
          <video className="vid" ref={this.remoteVideoRef} autoPlay />
          <section className="main">
            <div className="peopleList" />
            <div className="chat-main">
              <div className="chat">
                {this.state.messages.map((m) => {
                  return m;
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
          </section>
        </header>
      </div>
    );
  }
}
