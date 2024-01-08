import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios'

const Landing = () => {
    // const onClickHandle =async ()=>{
    //     const url ="http://localhost:3001/print"
    //     fetch(url, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           // Additional headers if required
    //         },
    //         body: JSON.stringify({ /* Your request body */ })
    //       })
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Network response was not ok');
    //         }
    //         return response.text(); // or response.json() if the server responds with JSON
    //       })
    //       .then(text => {
    //         console.log(text); // This will log "message received"
    //       })
    //       .catch(error => {
    //         console.error('Fetch error:', error);
    //       });
          
    // }
    const onClickHandle =()=>{
        const url ="http://localhost:3001/print"
        axios({
          method: 'post',
          url : url,
          
          data: {message:"hello from front end"}
        }).then(response=> {
            console.log(response)
            console.log(response.data)
        }).catch (error =>{
            console.log(error)
        })


        

    }
  return (
    <>
      <header style={{ textAlign: "center" }}>
        <h1>Welcome to my world</h1>
      </header>
      <main style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        <Link
          to="/signup"
          style={{
            textDecoration: "none",
            border: "1px solid gray",
            padding: "0.5rem 1rem",
            backgroundColor: "wheat",
            color: "#333",
          }}
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            border: "1px solid gray",
            padding: "0.5rem 1rem",
            backgroundColor: "whitesmoke",
            color: "#333",
          }}
        >
          Login
        </Link>
        <button style={{
            textDecoration: "none",
            border: "1px solid gray",
            padding: "0.5rem 1rem",
            backgroundColor: "whitesmoke",
            color: "#333",
          }}
           onClick ={onClickHandle}>Click Here</button>
      </main>
    </>
  );
};

export default Landing;