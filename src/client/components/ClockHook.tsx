import React, {useEffect, useState} from "react";

const Clock = (): JSX.Element => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return <h2>{time.toLocaleTimeString()}</h2>;
};

export default Clock;
