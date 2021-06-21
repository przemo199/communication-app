import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from 'react-bootstrap';
import Clock from './components/Clock';
import MainComponent from './components/MainComponent';

class App extends React.Component {
  currentPage: string;

  constructor(props: { currentPage: string }) {
    super(props);
    this.currentPage = 'mainPage';
    this.state =
      {view: 'buttons'}
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    this.setState({page: 'mainPage'})
  }

  changePage(pageName: string) {
    switch (pageName) {
      case "mainPage":
        this.currentPage = pageName;
        this.setState({page: 'mainPage'})
        break;
      case "secondPage":
        this.currentPage = pageName;
        this.setState({page: 'secondPage'})
        break;
      default:
        console.log('[App class] This page does not Exist');
        break;
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {MainComponent()}
          <Clock/>
          {buttons}
        </header>
      </div>
    );
  }
}

const buttons =
  <div className="justify-content-md-center">
    <Button className="m-5" variant="success" size="lg">Create chat room</Button>
    <Button className="m-5" variant="primary" size="lg">Join chat room</Button>
  </div>

// ============================================

export default App;
