import { useEffect, useState } from "react"
import { secondToTimeFormatString } from "../dslib/ds-utils";

export default function CountdownWatch({onZero, referenceTime}) {
  const[count, setCount] = useState(0);
  
  useEffect(() => {
    let timerId;
    if (count < 0)
      setCount(onZero());
    else {
      timerId = setTimeout(() => setCount(count-1), 1000);
    }
    return() => clearTimeout(timerId);
  }, [onZero, count])

  useEffect(() => {
    if (typeof referenceTime === 'undefined')
      return;
    if (referenceTime - count > 5)
      setCount(referenceTime);
  }, [referenceTime])
  return (
    <div className="count-down-watch">
      <h4>{secondToTimeFormatString(count)}</h4>
    </div>
  )
}