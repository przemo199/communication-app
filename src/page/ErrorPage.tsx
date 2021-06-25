import React, { Dispatch, SetStateAction } from "react";

const ErrorPage = ({
  setCurrentPage,
}: {
  setCurrentPage: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <>
      <section className="InfoBox">
        <h2>Oops, Somethig Went Wrong</h2>
        <p>The requested page does not exist.</p>
        <button onClick={() => setCurrentPage("mainPage")}>Main Page</button>
      </section>
    </>
  );
};

export default ErrorPage;
