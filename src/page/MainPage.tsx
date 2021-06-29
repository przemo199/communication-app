import React, { Dispatch, SetStateAction, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Clock from "../components/ClockHook";
import MainComponent from "../components/MainComponent";

const MainPage = ({
  setCurrentPage,
  setCurrentRoom,
  setCreate,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  setCurrentRoom: Dispatch<SetStateAction<string>>;
  setCreate: Dispatch<SetStateAction<boolean>>;
}) => {
  const [pageState, setPageState] = useState("main");
  const [roomNumber, setRoomNumber] = useState("");

  const generateRandomRoomNumber = () => {
    const randomNumber = Math.round(Math.random() * 100000000);
    setRoomNumber(`${randomNumber}`);
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
      setCreate(true);
      setCurrentRoom(roomNumber);
      setCurrentPage("chatPage");
    } else if (pageState === "joinChatRoom" && validRoomNumber) {
      setCreate(false);
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
        <h2>Your ID : </h2>
        {MainComponent()}
        {pageState === "main" && mainNavButtons()}
        {pageState === "createChatRoom" && createJoinChatRoom()}
        {pageState === "joinChatRoom" && createJoinChatRoom()}
      </header>
    </div>
  );
};

export default MainPage;
