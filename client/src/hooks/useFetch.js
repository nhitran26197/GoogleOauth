import { useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async (response) => {

    const credential =response.credential
    console.log(credential)

    setLoading(true)
   
    axios.post(url,
      {credential: credential}).then(response =>{
      console.log(response.data)
      setLoading(false)
    }).catch(error =>{
      console.log(error)
    })

  }
  return { loading, error, handleGoogle };
};

export default useFetch;