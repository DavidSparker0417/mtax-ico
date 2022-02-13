import IconText from "./IconText";

export default function LineDesc({title, value, icon, style}) {
  return(
    <div className="line-desc" style={{...style}}>
      {
        icon 
        ? <IconText icon={icon} title={title} size="medium"/>
        : <h4>{title}</h4>
      }
      <h4>{value}</h4>
    </div>
  )
}