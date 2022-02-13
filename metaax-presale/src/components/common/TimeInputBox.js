import { useEffect, useState } from "react"

export default function TimeInputBox({style, retHandler, value}) {
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [range, setRange] = useState(0);

  useEffect(() => {
    const seconds = day * 86400 + hour * 3600 + minute * 60;
    setRange(seconds/60)
    if (typeof retHandler !== 'undefined')
      retHandler(seconds)
  }, [day, hour, minute])

  function handleChangeDay({target}) {
    const d = parseInt(target.value);
    if (d < 0 || d >= 10000)
      return;
    setDay(target.value)
  }

  function handleChangeHour({target}) {
    const h = parseInt(target.value);
    if (h < 0 || h > 24)
      return;
    setHour(target.value)
  }

  function handleChangeMinute({target}) {
    const m = parseInt(target.value);
    if (m < 0 || m > 60)
      return;
    setMinute(target.value)
  }

  function handleRangeSlide({target})
  {
    const slideVal = target.value;
    setRange(slideVal);
    setDay(Math.round(slideVal/1440));
    setHour(Math.round((slideVal%1440)/60));
    setMinute(Math.round((slideVal%1440)%60));
  }

  return( <div 
    className="input-time"
    style={{...style}}
  >
    <input 
      className="range" 
      type="range" 
      value={range}
      min={value ? value.min : 0}
      max={value ? value.max : 100}
      onChange={handleRangeSlide}
    />
    <div className="content-hmiddle">
      <div className="content-vmiddle" style={{textAlign:"center"}}>
        <input 
          type="number" 
          onChange={handleChangeDay}
          value = {day}
        />
        <span>Days</span>
      </div>
      <div className="content-vmiddle" style={{textAlign:"center"}}>
        <input 
          type="number"
          onChange={handleChangeHour}
          value = {hour}
        />
        <span>Hours</span>
      </div>
      <div className="content-vmiddle" style={{textAlign:"center"}}>
        <input 
          type="number" 
          onChange={handleChangeMinute}
          value = {minute}
        />
        <span>Minutes</span>
      </div>
    </div>
  </div>)
}