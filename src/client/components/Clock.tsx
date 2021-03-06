import React from "react";

class Clock extends React.Component<any, any> {
  private timerID: NodeJS.Timeout;

  constructor(props: { timerID: NodeJS.Timeout }) {
    super(props);
    this.timerID = setTimeout(() => {}, 0);
    this.state = {
      date: new Date()
    };
  }

  componentDidMount() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
      this.tick,
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick = () => {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div className="m-5">
        <h2>{this.state.date.toLocaleTimeString()} </h2>
      </div>
    );
  }
}

export default Clock;
