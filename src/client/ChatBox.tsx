import React, {useState} from "react";
import {data, Message} from "./data/data";
import {Button, Form} from "react-bootstrap";

const ChatBox = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(data);
  const appendMessage = (message: Message) => {
    console.log(message);
    setMessages(messages.concat(message));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(name);
    console.log(message);
    if (name && message) {
      const toAppend: Message = {
        id: +Date.now().toString(),
        userName: name,
        message
      };
      appendMessage(toAppend);
    }
  };
  console.log(data);
  return (
    <>
      <div className="chatBox"/>
      {messages.map((message) => {
        return (
          <div id={"" + message.id}>
            <h2>{message.userName}</h2>
            <p>{message.message}</p>
          </div>
        );
      })}
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name: </label>
        <Form.Control
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <label htmlFor="message">Message: </label>
        <input
          type="text"
          id="message"
          name="message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <Button className="btn" type="submit">
          Send
        </Button>
      </form>
    </>
  );
};

export default ChatBox;
