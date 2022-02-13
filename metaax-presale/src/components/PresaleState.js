import { useEffect } from "react";
import CountdownWatch from "./CountdownWatch";
import LineDesc from "./LineDesc";

const iconInvestors = "./images/investors.svg"
const iconStake = "./images/stake.svg"
const iconLP = "./images/LP.svg"

// Showing general presale state such as lifetime, total amount, etc.
export default function PresaleState({info}) {
  return(
    <div className="meta-card">
      <div className="title">
        <h3>Presale State</h3>
        {/* <CountdownWatch reset={() => {return info.remainTime}} /> */}
      </div>
      <div style={{margin:"0 1.5rem"}}>
        <LineDesc title="Total Investors" value={info.investors} icon={iconInvestors}/>
        <LineDesc title="Staked MTAX" value={info.stakedToken} icon={iconStake}/>
        <LineDesc title="Total LPs" value={info.suppliedLP} icon={iconLP}/>
      </div>
    </div>)
}