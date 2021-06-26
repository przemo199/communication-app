import React, { Dispatch, SetStateAction } from "react";
import {Button} from "react-bootstrap";

const ErrorPage = ({
  setCurrentPage,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
}) => {
  let goToMainPage = () => {
    setCurrentPage("mainPage")
  }

  // return (
  //     <div className="App-header">
  //       <h2>Oops, Something Went Wrong</h2>
  //       <p>The requested page does not exist.</p>
  //       <Button variant="success" onClick={goToMainPage}>Main Page</Button>
  //     </div>
  // );
  return (
    <div className="App-header">
      <h2>OOPSIE WOOPSIE!!</h2>
      <p>UwU we made a fucky wucky!! A little fucko boingo! The code monkeys at our hedquarters are working VEWY HAWD to fix this!</p>
      <Button variant="light" onClick={goToMainPage}>Main Page</Button>
    </div>
  );
};

export default ErrorPage;
