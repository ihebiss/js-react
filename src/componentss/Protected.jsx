import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Content from "../Content";

const Protected = ({ token, roles }) => {
  const isRun = useRef(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;

    const config = {
      headers: {
        authorization: `Bearer ${token}`, 
      },
    };

    axios
      .get("http://localhost:3000/", config)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [token, roles]);
  return (
    <>
      <Content data={data} /> 
    </>
  );
};

export default Protected;
