import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { mtaxReclaim } from "./ContractInterface";
import CountdownWatch from "./CountdownWatch";
import LineDesc from "./LineDesc";

const iconLP = "./images/LP.svg"
const iconBNB = "./images/BNB.svg"
// Showing user's presale info(balance, total LP, reserved LP ...)
export default function BalanceStateCard({info}) {
  const [state, setState] = useState('idle')
  const wallet = useWallet()

  useEffect(() => {
    if (!wallet.isConnected())
    {
      setState('none');
      return;
    }
    if (info.remainTime == 0)
    {
      if (info.reservedLP) {
        setState('reserved')
      }
      else if (info.ownLP) {
        setState('owner')
      }
      else {
        setState('idle')
      }
    }
    else
      setState('waiting')
  }, [info.reservedLP, info.remainTime, info.ownLP, wallet.status])

  async function handleReclaim() {
    const provider = wallet._web3ReactContext.library;
    setState('transacting')
    const transaction = mtaxReclaim(provider);
    await transaction.then(function(receipt) {
      setState('')
    }).catch(function(err) {
      setState('reserved')
    })
  }
  return(
  <div className="meta-card">
    <div className="title">
      <h3>Your Balance</h3>
      <div>
        <BalanceUX 
          state={state} 
          remainTime={info.remainTime}
          reclaimHandler = {handleReclaim}
        />
      </div>
    </div>
    <div style={{margin:"0 1.5rem"}}>
      <LineDesc title="BNB" value={info.balance} icon={iconBNB}/>
      <LineDesc title="Own LPs" value={info.ownLP} icon={iconLP}/>
      <LineDesc 
        title="Reserved LPs" 
        value={info.reservedLP} 
        icon={iconLP}
        style={{color:"rgb(235, 113, 106)"}}
      />
    </div>
  </div>)
}

const BalanceUX = ({state, remainTime, reclaimHandler}) => {
  if (state === 'none') {
    return(
      <div className="blink">
        Wallet not connected!
      </div>
    )
  }
  else if (state === 'idle') {
    return(
      <div className="blink">
        You have not pre-staked yet!
      </div>
    )
  }
  else if (state === 'waiting') {
    return(
      <CountdownWatch reset={() => remainTime}/>
    )
  }
  else if (state === 'reserved') {
    return(
      <div className="animated-button11" onClick={reclaimHandler}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        Reclaim!
      </div>
    )
  }
  else if (state === 'transacting') {
    return(<div className="blink">
      Performing Reclaim...
    </div>)
  }
  else {
    return(<></>)
  }
}