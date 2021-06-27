import React, { Dispatch, SetStateAction, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Clock from "../components/ClockHook";
import MainComponent from "../components/MainComponent";
import Peer from "peerjs";

const MainPage = ({
  setCurrentPage,
  setCurrentRoom,
  peer,
  conn,
  setConn,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  setCurrentRoom: Dispatch<SetStateAction<string | null>>;
  peer: Peer;
  conn: Peer.DataConnection | undefined;
  setConn: Dispatch<SetStateAction<Peer.DataConnection | undefined>>;
}) => {
  const [pageState, setPageState] = useState("main");
  const [roomNumber, setRoomNumber] = useState("");

  const generateRandomRoomNumber = () => {
    const randomNumber = Math.round(Math.random() * 100000000);
    setRoomNumber(`#${randomNumber}`);
  };

  const mainNavButtons = () => {
    return (
      <div className="nav-buttons">
        <Button
          variant="success"
          className="m-3"
          onClick={() => setPageState("createChatRoom")}
        >
          Create Chat Room
        </Button>
        <Button
          variant="primary"
          className="m-3"
          onClick={() => setPageState("joinChatRoom")}
        >
          Join Chat Room
        </Button>
        <Button
          variant="danger"
          className="m-3"
          onClick={() => setCurrentPage("errorPage")}
        >
          Non existent Page
        </Button>
      </div>
    );
  };

  const checkRoomNumber = (number: string) => {
    // roomNumber does not need to be passed here as number, constant is available from parent function
    //TODO: more complicated room number checking, i.e. checking whether room already exists
    return 1 && number;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let validRoomNumber = checkRoomNumber(roomNumber);
    if (pageState === "createChatRoom" && validRoomNumber) {
      peer.on("connection", (conn) => {
        setConn(conn);
        conn.on("data", (data) => {
          console.log(data);
        });
        conn.on("open", () => {
          conn.send("[Connection Open]");
        });
      });
      setCurrentRoom(roomNumber);
      setCurrentPage("chatPage");
    } else if (pageState === "joinChatRoom" && validRoomNumber) {
      setConn(peer.connect(roomNumber));
      conn?.on("data", (data) => {
        console.log(data);
      });
      conn?.on("open", () => {
        conn.send("[Connection Open]");
      });
      setCurrentRoom(roomNumber);
      setCurrentPage("chatPage");
    }
  };

  const createJoinChatRoom = () => {
    return (
      <div className="createChatRoomFormContainer">
        <form className="createChatRoomForm" onSubmit={handleFormSubmit}>
          <Form.Control
            type="text"
            placeholder="Room ID"
            value={roomNumber}
            onChange={(e) => {
              setRoomNumber(e.target.value);
            }}
          />
          <Button
            className="m-2"
            type="button"
            onClick={generateRandomRoomNumber}
          >
            Random
          </Button>
          <Button className="m-2" variant="success" type="submit">
            Submit
          </Button>
        </form>
        <Button variant="light" onClick={() => setPageState("main")}>
          Main
        </Button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <Clock />
        <h2>Your ID : {peer.id}</h2>
        {MainComponent()}
        {pageState === "main" && mainNavButtons()}
        {pageState === "createChatRoom" && createJoinChatRoom()}
        {pageState === "joinChatRoom" && createJoinChatRoom()}
      </header>
    </div>
  );
};

export default MainPage;
