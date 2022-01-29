import '../CSS/Supplier.css'
import '../App.css'
import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import abiJson from '../Utils/abi.json'
import MetaMaskLogo from '../Images/MetaMask_Logo.svg'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import StatusBox from './StatusBox'
import CompoundBorrower from './CompoundBorrower'
import CompoundReturnBorrow from './CompoundReturnBorrow'
import CompoundSupplier from './CompoundSupplier'
import Logo from '../Images/logo.png'

const { cErcAbi } = require('../contracts.json')
const ethDecimals = 18
const underlyingDecimals = 18 // Number of decimals defined in this ERC20 token's contract
let cToken = ''
const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643' // cDai
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
const provider1 = new ethers.providers.Web3Provider(window.ethereum, 'any')

function Homepage () {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [currentCETHBalance, setCurrentCETHBalance] = useState(0)
  const [borrowBalance, setBorrowBalance] = useState(0)
  const [currentRate, setCurrentRate] = useState(0)
  const [metaMaskInstalled, setmetaMaskInstalled] = useState(true)
  const [cEthContract, setcEthContract] = useState(null)
  const [ethAmount, setEthAmount] = useState(0)
  const [cToken, setCtoken] = useState(0)

  useEffect(() => {
    updateBalance()
  }, [currentAccount, cEthContract])

  const disconnectWalletHandler = () => {}

  const connectWalletHandler = async () => {
    const { ethereum } = window

    if (!ethereum) {
      setmetaMaskInstalled(false)
      console.log('Make sure you have Metamask installed!')
      return
    } else {
      console.log("Wallet exists! We're ready to go!")
      console.log(ethereum)
    }
    await provider1.send('eth_requestAccounts', [])
    const signer = provider1.getSigner()
    let address = await signer.getAddress()
    setCurrentAccount(address)
    let contract = new ethers.Contract(contractAddress, abiJson, signer)
    setCtoken(new ethers.Contract(cTokenAddress, cErcAbi, signer))
    setcEthContract(contract)
    updateBalance()
  }

  const updateBalance = async () => {
    if (currentAccount && cEthContract) {
      let ethBalance =
        +(await provider1.getBalance(currentAccount)) /
        Math.pow(10, ethDecimals)
      setCurrentBalance(ethBalance.toFixed(4))
      let cTokenBalance =
        +(await cEthContract.callStatic.balanceOf(currentAccount)) / 1e8
      setCurrentCETHBalance(cTokenBalance.toFixed(4))
      let exchangeRateCurrent = await cEthContract.callStatic.exchangeRateCurrent()
      exchangeRateCurrent =
        exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8)
      setCurrentRate(exchangeRateCurrent.toFixed(6))

      let balance = await cToken.callStatic.borrowBalanceCurrent(currentAccount)
      balance = balance / Math.pow(10, underlyingDecimals)
      setBorrowBalance(balance)
    }
  }

  const connectWalletButton = () => {
    if (currentAccount) {
      return (
        <button onClick={disconnectWalletHandler} class='d-flex metamask'>
          <img
            src={MetaMaskLogo}
            alt='metamask logo'
            height='40'
            class='d-inline-block align-text-top metamask-logo'
          ></img>
          <h5 className='connect'>{currentAccount}</h5>
        </button>
      )
    } else if (metaMaskInstalled) {
      return (
        <button onClick={connectWalletHandler} class='d-flex metamask'>
          <img
            src={MetaMaskLogo}
            alt='metamask logo'
            height='40'
            class='d-inline-block align-text-top metamask-logo'
          ></img>
          <h5 className='connect'>Connect Wallet</h5>
        </button>
      )
    } else {
      return (
        <button class='d-flex metamask install'>
          <img
            src={MetaMaskLogo}
            alt='metamask logo'
            height='40'
            class='d-inline-block align-text-top metamask-logo'
          ></img>
          <h5 className='connect'>Please Install MetaMask!</h5>
        </button>
      )
    }
  }

  return (
    <>
      <div className='header'>
        <nav class='navbar navbar-light'>
          <div class='container-fluid'>
            <a class='navbar-brand' href='#'>
              <img
                src={Logo}
                alt=''
                width='60'
                height='40'
                class='d-inline-block align-text-top'
              ></img>
              <h1 className='title'>Compound Dapp</h1>
            </a>
            {connectWalletButton()}
          </div>
        </nav>
        <div className='row status'>
          <div className='col'>
            <StatusBox title='ETH Balance:' balance={currentBalance} />
          </div>
          <div className='col'>
            <StatusBox title='cETH Balance:' balance={currentCETHBalance} />
          </div>
          <div className='col'>
            <StatusBox title='cETH/ETH Exchange Rate:' balance={currentRate} />
          </div>
          <div className='col'>
            <StatusBox
              title='Borrow Balance:'
              balance={borrowBalance ? borrowBalance.toFixed(4) : 0}
            />
          </div>
        </div>
      </div>
      <div className='row services-row'>
        <div className='col'>
          <CompoundSupplier
            title='Supply ETH'
            contract={cEthContract}
            update={updateBalance}
          />
        </div>
        <div className='col'>
          <CompoundBorrower
            title='Borrow DAI'
            balance={currentCETHBalance}
            update={updateBalance}
            setBorrowBalance={setBorrowBalance}
          />
        </div>
        <div className='col'>
          <CompoundReturnBorrow
            title='Return Borrowed DAI'
            balance={currentCETHBalance}
            update={updateBalance}
            setBorrowBalance={setBorrowBalance}
          />
        </div>
      </div>
    </>
  )
}

export default Homepage
