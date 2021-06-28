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
  const goToMainPage = () => {
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
      setPeerSetValue(peerInput);
      console.log(peerSetValue);
      setPeer(new Peer(peerSetValue));
      setPeerInput("");
    }
  };

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
