export default function DropDown({list, unit, handleChange}) {
  return (
  <div style={{marginBottom:"10px"}}>
    <select onChange={({target}) => handleChange(target.value)}>
      {
        list?.map((t, id) => {
          return(
            <option key={id} value={t}>{t} {unit ? unit : ""}</option>
          )
        })
      }
    </select>
  </div>
  );
}