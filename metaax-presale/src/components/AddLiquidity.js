import { useEffect, useState } from "react";
import LiqInputBox from "./LiqInputBox";
import PriceInfoCard from "./PriceInfoCard";
import {mtaxAddLiquidity} from "./ContractInterface"
import { useWallet } from "use-wallet";
import {toHumanizeFixed} from "../utils";
const bnbIcon = './images/BNB.svg';
const tokenIcon = './images/mtax.svg';
const lockTimeIcon = './images/lockout.svg';

export default function AddLiquidity({priceInfo, balance, timeRemain}) {
  const wallet = useWallet();
  const [inpBnbValue, setInpBnbValue] = useState();
  const [inpMtaxValue, setInpMtaxValue] = useState();
  const [lockout, setLockout] = useState();
  const [logString, setLogString] = useState();
  const [adlButtonEnabled, setAdlButtonEnabled] = useState(true)
  
  // input handler of BNB input box
  function handleEnterInBNB(v) {
    setInpBnbValue(v)
    const tokenAmount = toHumanizeFixed(v*priceInfo.current.bnbPerMtax);
    setInpMtaxValue(tokenAmount);
  }

  // input handler of MTAX input box
  function handleEnterInMtax(v) {
    setInpMtaxValue(v);
    const bnbAmount = toHumanizeFixed(v*priceInfo.current.mtaxPerBNB)
    setInpBnbValue(bnbAmount);
  }

  // input handler of lockout input box
  function handleLockout(v) {
    setLockout(v);
  }

  // hanlder of add liquidity
  async function handleAddLiquidity() {
    const provider = wallet._web3ReactContext.library;
    if (provider === undefined)
    {
      logout("Wallet not connected!") 
      return
    }
    if (inpBnbValue === undefined || inpBnbValue === 0)
    {
      logout("Input value is empty!")
      return
    }
    if (lockout === undefined || lockout === 0) {
      logout("You should enter lock time!")
      return
    }
    logout("Waiting...")
    setAdlButtonEnabled(false)
    const transaction = mtaxAddLiquidity(provider, inpBnbValue, inpMtaxValue, lockout);
    await transaction.then(function(recipent) {
      logout("Success")
      setAdlButtonEnabled(true)
    }).catch(function(error) {
      logout(error.message)
      setAdlButtonEnabled(true)
    })
  }

  // show log text
  function logout(logStr) {
    setLogString(logStr);
  }

  // display logbox or not
  useEffect(() => {
    const timerId = setTimeout(()=>setLogString(undefined), 10000)
    return() => clearTimeout(timerId);
  }, [logString])

  return(
  <div className="meta-card">
    <div className="title" style={{justifyContent:"center"}}>
      <h3>Add Liquidity</h3>
    </div>
    <div className="adl-main">
      <div className="adl-control-panel">
        <div className="adl-input">
          <LiqInputBox 
            title="Input" 
            icon={bnbIcon} 
            balance={balance} 
            option="MAX" 
            unit="BNB"
            enterHandler={handleEnterInBNB}
            value={inpBnbValue}
          />
          <div style={{textAlign:"center", fontSize:"1.2rem", fontStyle:"bold"}}>+</div>
          <LiqInputBox 
            title="Input"
            icon={tokenIcon}
            unit="MTAX"
            enterHandler={handleEnterInMtax}
            value={inpMtaxValue}
            style={{marginBottom:"1rem"}}
          />
          <LiqInputBox 
            title="Lock Time"
            icon={lockTimeIcon}
            unit="Time"
            enterHandler={handleLockout}
            value={{min:0, max:525600/*minutes for 1 year*/}}
            type='time'
          />
        </div>
        <div className="adl-refer">
          <PriceInfoCard priceInfo={priceInfo}/>
        </div>
      </div>
      <button 
        className="glow-on-hover"
        onClick={handleAddLiquidity}
        disabled={!adlButtonEnabled}
      > 
        Add Liquidity
      </button>
      {
      logString 
        ? <div className="logbox" style={{marginTop:"10px"}}>
            {logString}
          </div>
        : null
      }
    </div>
  </div>)
}