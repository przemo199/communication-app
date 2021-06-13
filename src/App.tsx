import React from 'react';
import logo from './logo.svg';
import './App.css';

import ClockInterface from './interfaces/ClockInterface';

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <Clock />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div>
        <h1>Welcome to AnonComms</h1>
          <p>Use this app to communicate with other anons via a peer-to-peer connection</p>
          <p>This is another sentence</p>
      </div>
    </div>
  );
}

interface DisplayClockInterface{
    date: Date;
}

function FormattedDate(props:DisplayClockInterface) {
    return <h2>It is {props.date.toLocaleTimeString()}.</h2>;
}

class Clock extends React.Component<any, any> {
    private timerID: NodeJS.Timeout;
    constructor(props:ClockInterface) {
        super(props);
        this.state = {date: new Date()};
        this.timerID = setInterval(()=> this.tick(), 1000);
    }

    componentDidMount() {
        clearInterval(this.timerID);
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        return (
            <div>
                <FormattedDate date={this.state.date} />
            </div>
        );
    }
}

export default App;
