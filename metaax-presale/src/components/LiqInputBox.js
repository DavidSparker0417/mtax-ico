import { useState } from "react";
import DropDown from "./common/DropDown";
import TextBox from "./common/TextBox";
import TimeInputBox from "./common/TimeInputBox";
import IconText from "./IconText";
import LineDesc from "./LineDesc";

export default function LiqInputBox({
  title, 
  type,
  icon, 
  option, 
  balance, 
  unit, 
  placeholder, 
  enterHandler, 
  value, 
  list,
  style}) {
  
  return(
    <div className="liq-inpbox" style={{...style}}>
      <LineDesc 
        title={title} 
        value={balance !== undefined ? `Balance: ${balance}` : ""}
        style={{width:"100%"}}
      />
      <div style={{display:"flex", marginLeft:"2rem", marginRight:"2rem", justifyContent:"space-between"}}>
      <div className="container-ver-split" style={{with:"80%", paddingRight:"8px"}}>
        { type ==='time'
          ? <DropDown list={list} unit="Min" handleChange={enterHandler} />// <TimeInputBox retHandler={enterHandler} value={value}/>
          : <TextBox 
              placeholder={placeholder}
              value={value} 
              balance={balance} 
              option={option}
              enterHandler={enterHandler}
            />
        }
        </div>
        <IconText icon={icon} title={unit} size="small" style={{width:"20%"}}/>
      </div>
    </div>
  )
}