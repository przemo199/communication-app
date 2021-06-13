import React from 'react';
import logo from './logo.svg';
import './App.css';

import ClockInterface from './interfaces/ClockInterface';
import AppInterface from './interfaces/AppInterface';

class App extends React.Component {
    currentPage: string;

    constructor(props: AppInterface) {
        super(props);
        this.setState({page: "mainPage"})
        this.currentPage = "mainPage";

        this.changePage = this.changePage.bind(this);
    }

    componentDidMount() {
        this.setState({});
    }

    changePage(pageName: string) {
        switch (pageName) {
            case "mainPage":
                this.currentPage = pageName;
                this.setState({page: "mainPage"})
                break;
            case "secondPage":
                this.currentPage = pageName;
                this.setState({page: "secondPage"})
                break;
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <Clock/>
                    <img src={logo} className="App-logo" alt="logo"/>
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
                {this.currentPage === "mainPage" && mainPage  /*in js true && expression evaluates to expression,*/}
                {this.currentPage === "secondPage" && secondPage   /*false && expression evaluates to false*/}
                <button onClick={() => this.changePage("mainPage")}>Main Page</button>
                <button onClick={() => this.changePage("secondPage")}>Second Page</button>
            </div>
        );
    }
}

// ================[Pages]=====================
// ===============[MainPage]===================
const mainPage =
    <div>
        <h1>Welcome to AnonComms</h1>
        <p>Lorem Ipsum Dolor Sit Amet</p>
    </div>

// ==============[SecondPage]==================
const secondPage =
    <div>
        <h1>Welcome to AnonComms</h1>
        <p>This is a second Page</p>
    </div>

// ============================================

// =================[Clock]====================
/**
 * Interface for props used in the Clock class
 */
interface DisplayClockInterface {
    date: Date;
}

function FormattedDate(props: DisplayClockInterface) {
    return <h2>{props.date.toLocaleTimeString()}</h2>;
}

class Clock extends React.Component<any, any> {
    private timerID: NodeJS.Timeout;

    constructor(props: ClockInterface) {
        super(props);
        this.state = {date: new Date()};
        this.timerID = setInterval(() => this.tick(), 1000);
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
                <FormattedDate date={this.state.date}/>
            </div>
        );
    }
}

// ============================================


export default App;
