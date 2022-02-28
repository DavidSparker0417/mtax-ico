import { useEffect, useState } from "react";
import LiqInputBox from "./LiqInputBox";
import PriceInfoCard from "./PriceInfoCard";
import {mtaxAddLiquidity} from "./ContractInterface"
import { useWallet } from "use-wallet";
import {toHumanizeFixed} from "../dslib/ds-utils";
import {dsErrMsgGet, dsWeb3IsAddrValid} from "../dslib/ds-web3"
const bnbIcon = './images/BNB.svg';
const tokenIcon = './images/mtax.svg';
const lockTimeIcon = './images/lockout.svg';
const iconRecommender = './images/recommender.svg'

export default function AddLiquidity({priceInfo, balance, lockPolicy}) {
  const wallet = useWallet();
  const [inpBnbValue, setInpBnbValue] = useState();
  const [inpMtaxValue, setInpMtaxValue] = useState();
  const [lockout, setLockout] = useState();
  const [recommender, setRecommender] = useState();
  const [logString, setLogString] = useState();
  const [adlButtonEnabled, setAdlButtonEnabled] = useState(true)
  const [addtionalCostRate, setAddtionalCostRate] = useState(0)
  const [discount, setDiscount] = useState(0);
  const [notify, setNotify] = useState("Please, add liquidity.")
  
  useEffect(() => {
    const p = (priceInfo.current/priceInfo.publish) * 100;
    setDiscount(p.toFixed(1));
  }, [priceInfo.current, priceInfo.publish])
  
  useEffect(() => {
    if (typeof inpMtaxValue === 'undefined')
      return
    const liqBnb = inpMtaxValue*priceInfo.current;
    const additionalBnb = liqBnb*addtionalCostRate/100
    setInpBnbValue(toHumanizeFixed(liqBnb + additionalBnb))
  }, [addtionalCostRate])

  // useEffect(() => {
  //   setLockout(lockPolicy.lockL)
  // }, [lockPolicy])

  useEffect(() => {
    let rate
    if (lockout >= lockPolicy.lockM && lockout < lockPolicy.lockH)
      rate = priceInfo.discountL
    else if (lockout >= lockPolicy.lockH)
      rate = priceInfo.discountH
    else 
      rate = priceInfo.discount
    setAddtionalCostRate(rate)
  }, [lockout, lockPolicy, priceInfo])

  useEffect(() => {
    if (typeof inpBnbValue === 'undefined' || parseFloat(inpBnbValue) === 0
     || typeof inpMtaxValue === 'undefined' || parseFloat(inpMtaxValue) === 0
     || typeof lockout === 'undefined' || parseInt(lockout) === 0) {
      return;
    }
    
    const liqBnb = toHumanizeFixed(inpMtaxValue*priceInfo.current)
    const additionalBnb = toHumanizeFixed(inpBnbValue - liqBnb)
    const nstr = () => {
      return (
        <>
        <p>Pay {inpBnbValue} BNB (liquidity:{liqBnb}, additional cost : {additionalBnb}).</p>
        <p>You will get LP({liqBnb} BNB, {inpMtaxValue} MTAX) after {lockout/60} minutes.</p>
        </>
      )
    }
    setNotify(nstr)
  }, [inpBnbValue, inpMtaxValue, lockout])

  // input handler of BNB input box
  function handleEnterInBNB(v) {
    setInpBnbValue(v)
    const mtaxPerBnb = 1/priceInfo.current
    const tokenAmount = (v*mtaxPerBnb*100)/(addtionalCostRate + 100)
    setInpMtaxValue(toHumanizeFixed(tokenAmount))
  }

  // input handler of MTAX input box
  function handleEnterInMtax(v) {
    setInpMtaxValue(v);
    const bnbPerMtax = priceInfo.current;
    const bnbAmount = parseFloat(v*bnbPerMtax)
    const liqBnb = bnbAmount * addtionalCostRate / 100
    setInpBnbValue(toHumanizeFixed(bnbAmount + liqBnb));
  }

  // input handler of lockout input box
  function handleLockout(v) {
    console.log(v);
    setLockout(v*60);
  }

  function handleInputRecommender(v) {
    setRecommender(v);
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
    if (recommender===wallet.account) {
      logout("Recommender address must not be the same as your wallet address.")
      return
    }
    if (recommender && !dsWeb3IsAddrValid(recommender))
    {
      logout("Recommender address is not valid!")
      return
    }
    logout("Waiting...")
    setAdlButtonEnabled(false)
    const transaction = mtaxAddLiquidity(
      provider, 
      inpBnbValue, 
      inpMtaxValue, 
      lockout, 
      recommender
    );
    await transaction.then(function(recipent) {
      logout("Success")
      setAdlButtonEnabled(true)
    }).catch(function(error) {
      const msg = dsErrMsgGet(error.message)
      logout(msg)
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
      <div style={{marginBottom:"1rem"}}>
        <ul>You can purchase MTAX token at a 50% discount.</ul>
        <li>{100-discount}% discount for lock {'<'} {lockPolicy.lockM/60} min.</li>
        <li>{100-priceInfo.discountL}% discount for lock {lockPolicy.lockM/60} ~ {lockPolicy.lockH/60} min.</li>
        <li>{100-priceInfo.discountH}% discount for lock {'>='} {lockPolicy.lockH/60} min.</li>
      </div>
      <div className="adl-control-panel">
        <div className="adl-input">
          <LiqInputBox 
            title="Input" 
            icon={bnbIcon} 
            balance={balance} 
            option="MAX" 
            unit="BNB"
            placeholder="Amount of BNB"
            enterHandler={handleEnterInBNB}
            value={inpBnbValue}
          />
          <div style={{textAlign:"center", fontSize:"1.2rem", fontStyle:"bold"}}>+</div>
          <LiqInputBox 
            title="Input"
            icon={tokenIcon}
            unit = 'MTAX'
            placeholder="Amount of MTAX"
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
            list={[lockPolicy.lockL/60, lockPolicy.lockM/60, lockPolicy.lockH/60]}
            style={{marginBottom:"1rem"}}
          />
          <LiqInputBox 
            title="Recommender(optional)"
            icon={iconRecommender}
            enterHandler={handleInputRecommender}
            unit="Address"
            placeholder="Recommender's wallet"
            value={recommender}
          />
        </div>
        <div className="adl-refer">
          <PriceInfoCard priceInfo={priceInfo} discount={discount} notify={notify}/>
        </div>
      </div>
      <button 
        className="glow-on-hover"
        onClick={handleAddLiquidity}
        disabled={!adlButtonEnabled}
        style={{width:"100%"}}
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