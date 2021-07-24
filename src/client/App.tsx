import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Form} from "react-bootstrap";
import Clock from "./components/Clock";
import MainComponent from "./components/MainComponent";

interface AppState {
  view: string;
}

class App extends React.Component<any, AppState> {
  currentPage: string;

  constructor(props: { currentPage: string }) {
    super(props);
    this.currentPage = "mainPage";
    this.state = {
      view: "buttons"
    };
  }

  setView = (view: string) => {
    this.setState({view: view});
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {MainComponent()}
          <Clock />
          {this.state.view === "buttons" && Buttons({setView: this.setView})}
          {this.state.view === "create" && Create({setView: this.setView})}
          {this.state.view === "join" && Join({setView: this.setView})}
          {/*{this.state.view === "chat" && chat}*/}
        </header>
      </div>
    );
  }
}

function Buttons(props: any) {
  let createButtonClicked = () => {
    props.setView("create");
  };

  let joinButtonClicked = () => {
    props.setView("join");
  };

  return (
    <div className="justify-content-md-center">
      <Button
        className="m-5"
        variant="success"
        size="lg"
        onClick={createButtonClicked}
      >
        Create chat room
      </Button>
      <Button
        className="m-5"
        variant="success"
        size="lg"
        onClick={joinButtonClicked}
      >
        Join chat room
      </Button>
    </div>
  );
}

function Create(props: any) {
  function createButtonClicked() {
    props.setView("chat");
  }

  let returnButtonClicked = () => {
    props.setView("buttons");
  };

  return (
    <div>
      <Form>
        <Form.Control
          className="my-3"
          type="email"
          placeholder="Enter your code"
        />
        <Button className="m-3" variant="light" onClick={returnButtonClicked}>
          🠔
        </Button>
        <Button className="m-3" variant="primary" onClick={createButtonClicked}>
          Generate code
        </Button>
        <Button className="m-3" variant="success" onClick={createButtonClicked}>
          Create room
        </Button>
      </Form>
    </div>
  );
}

function Join(props: any) {
  function createButtonClicked() {
    props.setView("chat");
  }

  let returnButtonClicked = () => {
    props.setView("buttons");
  };

  return (
    <div>
      <Form>
        <Form.Control
          className="my-3"
          type="email"
          placeholder="Enter your code"
        />
        <Button className="m-3" variant="light" onClick={returnButtonClicked}>
          🠔
        </Button>
        <Button className="m-3" variant="success" onClick={createButtonClicked}>
          Join room
        </Button>
      </Form>
    </div>
  );
}

export default App;
