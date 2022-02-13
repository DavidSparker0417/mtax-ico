import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {UseWalletProvider} from 'use-wallet';
import {TARGET_NET} from './components/ContractInterface'

ReactDOM.render(
  <React.StrictMode>
    <UseWalletProvider 
      autoConnect
      chainId = {TARGET_NET.chainId}
      connectors = {{
        injected: {
          chainId:[TARGET_NET.chainId,],
          rpc: {
            97: TARGET_NET.url
          }
        },
        walletconnect: {
          rpc: {
            97 : TARGET_NET.url
          },
          bridge: 'https://bridge.walletconnect.org',
          pollingInterval: 12000,
        }
      }}
    >
      <App />
    </UseWalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
