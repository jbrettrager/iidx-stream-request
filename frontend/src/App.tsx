import React from "react";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage.tsx";
import HostView from "./HostView.tsx";
import GuestView from "./GuestView.tsx";
import NotFound from "./NotFound.tsx";
import StreamView from "./StreamView.tsx"
import "./App.css";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/8844eb6bfd1d1ef13cd8765087" element={<LandingPage />}></Route>
      <Route path="/host/:roomName" element={<HostView />}></Route>
      <Route path="/guest/:roomName" element={<GuestView  />}></Route>
      <Route path="/streamview/:roomName" element={<StreamView  />}></Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}

export default App;

//ideal for the host path - /host/:encryptedRoomNumber
//ideal for guest path = /guest/:givenName

//useParams(); -> returns all the params in an object
//so like, if we have /host/:encryptedRoomNumber, useParams(); will return encryptedRoomNumber in an object
//so you have that in the path param and then it returns it into the actual component's code
