export default function TextBox({placeholder, balance, enterHandler, value, option, disable, style}) {
  
  function handleChange({target}) {
    if (typeof enterHandler !== 'undefined')
      enterHandler(target.value);
  }

  function handleTapOnMax() {
    if (typeof balance === undefined || enterHandler === undefined)
      return;
    enterHandler(balance);
  }

  return(<>
    <input type="text" 
      onKeyPress={(event) => {
        if (!/[0-9.]+/.test(event.key)) {
          event.preventDefault();
        }
      }}
      className="effect-16" 
      placeholder={placeholder}
      onChange={handleChange}
      value= {value || ""}
      disabled = { disable ? "disabled" : "" }
      style={{width:"100%"}}
    />
    {
    option !== undefined 
      ? <span 
          className="content-vmiddle option-max"
          onClick={() => handleTapOnMax()}
          style={{cursor:"pointer"}}>
          {option}
        </span>
      : null
    }
    </>
  )
}