import React, {Dispatch, SetStateAction} from "react";
import {Button, Form} from "react-bootstrap";
import Clock from "../components/ClockHook";
import Peer, {DataConnection} from "peerjs";
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
  messages: React.DetailedHTMLProps<any, any>[];
}

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720
  }
}

const peerSettings = {
  debug : 3,
  host : "/",
  path: "/peerjs"
}

export default class ChatPage extends React.Component<ChatProps, ChatState> {
  constructor(props: ChatProps) {
    super(props);
    this.state = {
      peer: props.create ? new Peer(props.currentRoom, peerSettings) : new Peer(peerSettings),
      conns: [],
      message: "",
      messages: []
    }
  }

  componentDidMount() {
    this.state.peer.on("connection", (conn) => {
      this.setState({conns: [...this.state.conns, conn]}, () => {
        conn.on("data", (data) => {
          this.handleData(data);
        });

        conn.on("open", () => {
          conn.send(
            JSON.stringify({
              sender: this.state.peer.id,
              type: "connection",
              content: "Connection Open"
            })
          );

          conn.send(
            JSON.stringify({
              sender: this.state.peer.id,
              type: "peerIDList",
              content: this.state.conns.map(c => c.peer)
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
    });

    this.state.peer.on("open", (id) => {
      console.log("peer open")
      if (!this.props.create) {
        this.connectToPeer(this.props.currentRoom);
      }
    });
  }

  connectToPeer = (peerID: string) => {
    const conn = this.state.peer.connect(peerID);

    conn.on("open", () => {
      this.setState({conns: [...this.state.conns, conn]}, () => {
        conn.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "connection",
            content: "Connection Open"
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
        break;
      case "connection":
        console.log(`[Connection] ${message.content}`);
        break;
      case "peerIDList":
        message.content.forEach((peerID: string) => {
          if (peerID !== this.state.peer.id && this.state.conns.map(conn => conn.peer).indexOf(peerID) === -1) {
            this.connectToPeer(peerID);
          }
        });
        break;
      default:
        console.log("Incorrect data");
    }
  };

  appendMessage = (data: any) => {
    console.log(<p className={data.sender === "You" ? "you" : "foreign"}> data.content </p>);
    this.setState({
      messages: [...this.state.messages,
        <p className={data.sender === "You" ? "you" : "foreign"}> {data.content} </p>]
    });
    console.log(this.state.messages);
    // let textNode = document.createElement("p");
    // let date = new Date().toLocaleTimeString();
    // textNode.textContent =
    //   data.sender === "You"
    //     ? data.content + " (" + date + ") "
    //     : " (" + date + ") " + data.content;
    // let lastMessage = this.state.messages[this.state.messages.length];
    // // instead of making wide bar with sender name, show sender name on hover
    // let lastTitle;
    // if (lastMessage) {
    //   lastTitle = lastMessage.children[0];
    // }
    // if (lastTitle && lastTitle.getAttribute("sender") === data.sender) {
    //   chatRef.current.children[
    //   chatRef.current.children.length - 1
    //     ].appendChild(textNode);
    // } else {
    //   let divNode = document.createElement("section");
    //   divNode.classList.add(data.sender === "You" ? "you" : "foreign");
    //   let title = document.createElement("p");
    //   title.setAttribute("sender", data.sender);
    //   title.classList.add("title");
    //   title.textContent = data.sender;
    //   let colourNum = `${crc32.str(data.sender).toString(16)}`;
    //   colourNum = colourNum.padEnd(7, "0");
    //   title.style.backgroundColor = `#${colourNum.slice(1, 7)}`;
    //   divNode.appendChild(title);
    //   divNode.appendChild(textNode);
    //   chatRef.current.appendChild(divNode);
    // }
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (this.state.message.trim()) {
      this.appendMessage({sender: "You", content: this.state.message});
      this.state.conns.forEach((connection) => {
        connection.send(
          JSON.stringify({
            sender: this.state.peer.id,
            type: "message",
            content: this.state.message
          })
        );
      });
    }

    this.setState({message: ""});
  };

  goHome = () => {
    //this.state.peer.destroy();
    this.props.setCurrentPage("mainPage");
  };

  render() {
    console.log("rendering");
    console.log(this.state.peer.id)
    // if(!this.state.peer.id) {
    //   this.state.peer.reconnect();
    // }
    return (
      <div className="App">
        <header className="Chat-window">
          <section className="top-bar">
            <Button onClick={() => this.goHome()}>Home</Button>
            <h2
              className="YourID">{this.state.peer.id ? "Your ID: " + this.state.peer.id : "Connecting..."}</h2>
            <Clock/>
          </section>
          <video className="vid" autoPlay/>
          <video className="vid" autoPlay/>
          <section className="main">
            <div className="peopleList"/>
            <div className="chat-main">
              <div className="chat">
                {this.state.messages.map(m => {return m})}
              </div>
              <div className="input">
                <form onSubmit={this.handleSubmit}>
                  <Form.Control
                    type="text"
                    placeholder="Enter Message Here"
                    value={this.state.message}
                    onChange={(e) => {
                      this.setState({message: e.target.value});
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
                    style={{
                      backgroundColor: colour
                    }}
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
    )
  }
}
