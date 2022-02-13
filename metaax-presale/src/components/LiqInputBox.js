import { useState } from "react";
import TextBox from "./common/TextBox";
import TimeInputBox from "./common/TimeInputBox";
import IconText from "./IconText";
import LineDesc from "./LineDesc";

export default function LiqInputBox({
  title, icon, option, balance, unit, style, enterHandler, value, type}) {
  
  function handleChange({target}) {
    if (typeof enterHandler !== 'undefined')
      enterHandler(target.value);
  }
  
  return(
    <div className="liq-inpbox" style={{...style}}>
      <LineDesc 
        title={title} 
        value={balance !== undefined ? `Balance: ${balance}` : ""}
        style={{width:"80%"}}
      />
      <div style={{display:"flex", marginLeft:"2rem", marginRight:"2rem", justifyContent:"space-between"}}>
        { type ==='time'
          ? <TimeInputBox retHandler={enterHandler} value={value}/>
          : <TextBox 
              unit={unit} 
              value={value} 
              balance={balance} 
              option={option}
              enterHandler={enterHandler}
            />
        }
        {/* <input type="text" 
          onKeyPress={(event) => {
            if (!/[0-9.]+/.test(event.key)) {
              event.preventDefault();
            }
          }}
          className="effect-16" 
          placeholder={`Amount of ${unit}`}
          onChange={handleChange}
          value= {value || ""}
        />
        {
        option !== undefined 
          ? <span 
              className="content-vmiddle option-max"
              onClick={() => enterHandler(balance)}
              style={{cursor:"pointer"}}>
              {option}
            </span>
          : null
        } */}
        <IconText icon={icon} title={unit} size="small" style={{width:"20%"}}/>
      </div>
    </div>
  )
}