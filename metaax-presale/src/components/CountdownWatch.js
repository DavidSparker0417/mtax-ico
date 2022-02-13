import { useEffect, useReducer, useRef, useState } from "react"
import { secondToTimeFormatString } from "utils";

export default function CountdownWatch({reset}) {
  const[count, setCount] = useState(0);
  
  useEffect(() => {
    let timerId;
    if (count < 0)
      setCount(reset());
    else if (count => 0) {
      timerId = setTimeout(() => setCount(count-1), 1000);
    }
    return() => clearTimeout(timerId);
  }, [reset, count])

  return (
    <div className="count-down-watch">
      <h4>{secondToTimeFormatString(count)}</h4>
    </div>
  )
}