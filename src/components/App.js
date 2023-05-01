import React from "react";
import Header from "./Header";
import TicketControl from "./TicketControl";

function App(){
  console.log(process.env.REACT_APP_FIREBASE_API_KEY)
  return (
    <React.Fragment>
      <Header />
      <TicketControl />
    </React.Fragment>
  );
}

export default App;