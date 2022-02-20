import { useEffect } from "react";
import CountdownWatch from "./CountdownWatch";
import LineDesc from "./LineDesc";

const iconInvestors = "./images/investors.svg"
const iconStake = "./images/stake.svg"
const iconLP = "./images/LP.svg"
const iconBNB = "./images/BNB.svg"
const iconMtax = './images/mtax.svg';
// Showing general presale state such as lifetime, total amount, etc.
export default function PresaleState({info}) {
  return(
    <div className="meta-card">
      <div className="title">
        <h3>Presale State</h3>
        {/* <CountdownWatch onZero={() => {return info.remaining}} /> */}
      </div>
      <div style={{margin:"0 1.5rem"}}>
        <LineDesc title="Total Investors" value={info.investorCount} icon={iconInvestors}/>
        <LineDesc title="Staked MTAX" value={info.stakedMtax} icon={iconStake}/>
        <LineDesc title="Staked BNB" value={info.stakedBNB} icon={iconBNB}/>
        <LineDesc title="Total LPs" value={info.stakedLP} icon={iconLP}/>
        <LineDesc title="Spent Bonus" value={info.spentBonus} icon={iconBNB}/>
      </div>
    </div>)
}
