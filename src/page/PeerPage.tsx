import React, { Dispatch, SetStateAction, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Peer from "peerjs";

const PeerPage = ({
  setCurrentPage,
  setPeer,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
  setPeer: Dispatch<SetStateAction<Peer>>;
}) => {
  let goToMainPage = () => {
    if (peerSetValue) {
      setCurrentPage("mainPage");
    }
  };

  const [peerInput, setPeerInput] = useState<string>("");
  const [peerSetValue, setPeerSetValue] = useState("");

  const generateRandomPeerID = () => {
    const randomNumber = Math.round(Math.random() * 100000000);
    setPeerInput("");
    setPeerSetValue(`#${randomNumber}`);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (peerInput) {
      setPeer(new Peer(peerInput));
      setPeerInput("");
      setPeerSetValue(peerInput);
    }
  };

  // return (
  //     <div className="App-header">
  //       <h2>Oops, Something Went Wrong</h2>
  //       <p>The requested page does not exist.</p>
  //       <Button variant="success" onClick={goToMainPage}>Main Page</Button>
  //     </div>
  // );
  return (
    <div className="App-header">
      <h2>Enter your unique ID, or click random to generate a random ID</h2>
      <form onSubmit={handleFormSubmit}>
        <Form.Control
          type="text"
          placeholder="ID"
          value={peerInput}
          onChange={(e) => {
            setPeerInput(e.target.value);
          }}
        />
        <Button variant="light" onClick={generateRandomPeerID}>
          Random
        </Button>
        <p>Your ID : {peerSetValue}</p>
      </form>
      <Button variant="light" onClick={goToMainPage}>
        Continue
      </Button>
    </div>
  );
};

export default PeerPage;
