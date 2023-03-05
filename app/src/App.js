import { ethers } from "ethers";
import axios from "axios";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

const url = "http://localhost:3030/";

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.utils.parseEther(document.getElementById("eth").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    await escrowContract.deployed();
    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      approved: false,
      // handleApprove: async () => {
      //   escrowContract.on("Approved", () => approved(escrowContract.address));
      //   await approve(escrowContract, signer);
      // },
    };

    try {
      const result = await axios.post(url, escrow);
    } catch (err) {
      console.log(`post to server: `, err);
    }

    setEscrows([...escrows, escrow]);
  }

  async function approved(escrowContract) {
    document.getElementById(escrowContract.address).className = "complete";
    document.getElementById(escrowContract.address).innerText = "✓ It's been approved!";
    await approve(escrowContract, signer);
  }

  async function getEscrows() {
    try {
      const { data } = await axios.get(url);
      setEscrows(data.escrows);
    } catch (err) {
      console.log(`getEscrows: `, err);
    }
  }

  useEffect(() => {
    getEscrows();
  }, []);

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {signer &&
            escrows.map((escrow) => {
              return <Escrow key={escrow.address} {...escrow} signer={signer} />;
            })}
        </div>
      </div>
    </>
  );
}

export default App;
