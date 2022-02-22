import { 
  dsWalletConnectInjected,
  dsWalletGetTrimedAccountName
} from "../dslib/ds-web3";
import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { TARGET_NET } from "./ContractInterface";
import IconText from "./IconText";

export default function MainTitle({brandIcon, brandText, title}) {
  const wallet = useWallet();
  const [walletButtonFace, setWalletButtonFace] = useState("Wallet Connect");

  // event on wallet 
  useEffect(() => {
    if (wallet.status === 'connecting')
      return;
    const btnName = wallet.account !== null 
      ? dsWalletGetTrimedAccountName(wallet.account)
      : "Wallet Connect" ;
    setWalletButtonFace(btnName);
  }, [wallet.status])

  // halder on clicking wallet connect button
  async function handleConnectWallet() {
    if (wallet.isConnected()) return;
    if (window.ethereum)
    {
      await dsWalletConnectInjected(TARGET_NET.chainId);
      wallet.connect()
    }
    else
      wallet.connect('walletconnect');
  }

  return(
    <div className="main-title">
      <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between", padding:"0.5rem 0.5rem 0 0.5rem"}}>
        <a href='http://www.meta-ax.net/' target="_blank">
          <IconText title={brandText} icon={brandIcon}/>
        </a>
        <button className="wallet raise" onClick={handleConnectWallet}>
          {walletButtonFace}
        </button>
      </div>
      <div className="center">
        <div><h1>{title}</h1></div>
      </div>
    </div>
  )
}