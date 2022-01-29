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
import Logo from '../Images/logo.png'
import EthLogo from '../Images/ethereum-logo.png'

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
const ethDecimals = 18
const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'

function CompoundSupplier (props) {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [currentCETHBalance, setCurrentCETHBalance] = useState(0)
  const [currentRate, setCurrentRate] = useState(0)
  const [metaMaskInstalled, setmetaMaskInstalled] = useState(true)
  const [ethAmount, setEthAmount] = useState(0)

  const mintCTokenHandler = async ethAmount => {
    if (props.contract) {
      try {
        let tx = await props.contract.mint({
          value: ethers.utils.parseUnits(ethAmount.toString(), 'ether')
        })
        await tx.wait(1)
        props.update()
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    }
  }

  return (
    <>
      <div className='servicebox-container'>
        <div className='row'>
          <h2 className='title'>Supply ETH</h2>
        </div>
        <div className='row'>
          <div class='input-group mb-3'>
            <input
              type='numbers'
              value={ethAmount}
              onChange={val => setEthAmount(val.target.value)}
              class='form-control input-amount'
              placeholder='0.00'
              aria-label='ETH To Supply'
              aria-describedby='basic-addon2'
            ></input>
            <img
              src={EthLogo}
              className='input-group-text'
              alt='Eth logo'
              height={90}
            ></img>
          </div>
        </div>
        <div className='row'>
          <button onClick={() => mintCTokenHandler(ethAmount)} class='supply'>
            Supply
          </button>
        </div>
      </div>
    </>
  )
}

export default CompoundSupplier
