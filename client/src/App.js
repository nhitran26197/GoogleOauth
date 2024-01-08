import React, { useEffect } from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {  Landing, Login, CreateAccount } from "./screens";

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
      <Route
        path="/"
        element={ <Landing />}
      />
      <Route
    path="/signup"
    element={ <CreateAccount />}
  />
  <Route
    path="/login"
    element={ <Login />}
  />
        

      </Routes>
    </BrowserRouter>
  );
};

export default App;


