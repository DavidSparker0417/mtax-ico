import { useEffect, useState } from "react"

const prInfoStyle = {
  display: "flex",
  flexDirection: "column",
  width:"100%",
  borderRadius:"20px",
  margin:"2px",
  backgroundColor:"rgba(31 38 94)"
}
export default function PriceInfoCard({priceInfo, discount, notify}) {
  return(
    <div style={prInfoStyle}>
      <div className="title">
        <h3>Discount Price</h3>
        <h3>Publish Price</h3>
      </div>
      <div className="container-ver-split">
        <div className="container-hor-split" style={{display:"flex", width:"50%", padding:"1rem 1.5rem"}}>
          <PriceInfo 
            title="MTAX per BNB"
            value={priceInfo.current ? Math.round(1/priceInfo.current) : 0}
            color="#00FFFF"
            style={{marginBottom:"1rem"}}
          />
          <PriceInfo 
            title="BNB per MTAX"
            value={priceInfo.current}
            color="#00FFFF"
          />
        </div>
        <div style={{display:"inline-flex", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
          <div style={{marginTop:"-0.5rem", width:"2px", height:"100%", backgroundColor:"rgba(255, 255, 255, 0.4)"}}></div>
          <div className="circle content-vmiddle">
            {discount}%
          </div>
        </div>
        <div className="container-hor-split" style={{display:"flex", width:"50%", alignItems:"end", padding:"1rem 1.5rem"}}>
          <PriceInfo 
            title="MTAX per BNB"
            value={priceInfo.publish ? Math.round(1/priceInfo.publish) : 0}
            color="#EB716A" 
            style={{marginBottom:"1rem"}}
          />
          <PriceInfo 
            title="BNB per MTAX" 
            value={priceInfo.publish}
            color="#EB716A"
          />
        </div>
      </div>
      <div className="notify">
         {notify}
      </div>
    </div>
  )
}

function PriceInfo({title, value, color, style}) {
  return(
    <div className="align-center" style={{width:"fit-content", ...style}}>
      <div style={{fontSize:"1rem", fontWeight:"bold", color:color}}>
        {value}
      </div>
      <div>
        {title}
      </div>
    </div>
  )
}