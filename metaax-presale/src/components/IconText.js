export default function IconText({icon, title, size, style}) {
  const iconWidth = typeof size === undefined || size === 'small' || size == 'medium'
    ? '20px' : '50px';
  const iconHeight = typeof size === undefined || size === 'small' || size == 'medium'
    ? '20px' : '43px';
  
  return(
    <div style={{display:"flex", ...style}}>
      <div className="content-vmiddle">
        <img src={icon} width={iconWidth} height={iconHeight} alt={title}/>
      </div>
      <h2 className="content-vmiddle" style={{marginLeft:"0.5rem", fontSize:size}}>{title}</h2>
    </div>
  )
}