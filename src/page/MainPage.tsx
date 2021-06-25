import React, { Dispatch, SetStateAction, useState } from "react";
import Clock from "../components/ClockHook";
import MainComponent from "../components/MainComponent";

const MainPage = ({
  setCurrentPage,
  setCurrentRoom,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  setCurrentRoom: Dispatch<SetStateAction<string | null>>;
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
        <button onClick={() => setPageState("createChatRoom")}>
          Create Chat Room
        </button>
        <button onClick={() => setPageState("joinChatRoom")}>
          Join Chat Room
        </button>
        <button onClick={() => setCurrentPage("errorPage")}>
          Non existent Page
        </button>
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
      setCurrentRoom(roomNumber);
      setCurrentPage("chatPage");
    } else if (pageState === "joinChatRoom" && validRoomNumber) {
      setCurrentRoom(roomNumber);
      setCurrentPage("chatPage");
    }
  };

  const createJoinChatRoom = () => {
    return (
      <div className="createChatRoomFormContainer">
        <form className="createChatRoomForm" onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Room #"
            value={roomNumber}
            onChange={(e) => {
              setRoomNumber(e.target.value);
            }}
          />
          <button type="button" onClick={generateRandomRoomNumber}>
            Random
          </button>
          <button type="submit">Submit</button>
        </form>
        <button onClick={() => setPageState("main")}>Main</button>
      </div>
    );
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <Clock />
          {MainComponent()}
          {pageState === "main" && mainNavButtons()}
          {pageState === "createChatRoom" && createJoinChatRoom()}
          {pageState === "joinChatRoom" && createJoinChatRoom()}
        </header>
      </div>
    </>
  );
};

export default MainPage;
