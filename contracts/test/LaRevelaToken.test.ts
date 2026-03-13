import { expect } from "chai";
import { ethers } from "hardhat";
import { LaRevelaToken } from "../typechain-types";

describe("LaRevelaToken", function () {
  let token: LaRevelaToken;
  let owner: any;
  let alice: any;
  let bob: any;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("LaRevelaToken");
    token = (await Token.deploy(1_000_000)) as LaRevelaToken;
    await token.waitForDeployment();
  });

  it("assigns initial supply to the deployer", async function () {
    const balance = await token.balanceOf(owner.address);
    const expected = ethers.parseUnits("1000000", 18);
    expect(balance).to.equal(expected);
  });

  it("transfer() moves tokens between accounts", async function () {
    const amount = ethers.parseUnits("100", 18);
    await token.connect(owner).transfer(alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
  });

  it("transfer() reverts on insufficient balance", async function () {
    const amount = ethers.parseUnits("1", 18);
    await expect(
      token.connect(alice).transfer(bob.address, amount),
    ).to.be.revertedWith("LRT: insufficient balance");
  });

  it("faucet() mints 100 LRT to caller", async function () {
    await token.connect(alice).faucet();
    const balance = await token.balanceOf(alice.address);
    expect(balance).to.equal(ethers.parseUnits("100", 18));
  });

  it("approve() + transferFrom() works correctly", async function () {
    const amount = ethers.parseUnits("50", 18);
    await token.connect(owner).approve(alice.address, amount);
    await token.connect(alice).transferFrom(owner.address, bob.address, amount);
    expect(await token.balanceOf(bob.address)).to.equal(amount);
  });
});
