import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import data from "./artifacts/contracts/Escrow.sol/Escrow";

const url = "http://localhost:3030/approved";
export default function Escrow({ address, arbiter, beneficiary, value, approved, signer }) {
  const [contract, setContract] = useState(undefined);
  const [isApproved, setIsApproved] = useState(approved);

  async function getContract() {
    let c = new ethers.Contract(address, data.abi, signer);
    c.on("Approved", async () => {
      try {
        let {
          data: { done },
        } = await axios.post(url, { address });
        setIsApproved(done);
      } catch (err) {
        console.log(`Approved: `, err);
      }
    });
    setContract(c);
  }

  async function approve(escrowContract, signer) {
    const approveTxn = await escrowContract.connect(signer).approve({ gasLimit: "3000000" });
    await approveTxn.wait();
  }

  async function handleApprove() {
    // document.getElementById(contract.address).className = "complete";
    // document.getElementById(contract.address).innerText = "✓ It's been approved!";
    await approve(contract, signer);
  }

  useEffect(() => {
    getContract();
  }, []);

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} </div>
        </li>
        <div
          className={isApproved ? "complete" : "button"}
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          {isApproved ? "✓ It's been approved!" : "Approve"}
        </div>
      </ul>
    </div>
  );
}
