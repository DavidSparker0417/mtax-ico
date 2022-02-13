export default function TextBox({unit, balance, enterHandler, value, option}) {
  
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
          placeholder={`Amount of ${unit}`}
          onChange={handleChange}
          value= {value || ""}
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