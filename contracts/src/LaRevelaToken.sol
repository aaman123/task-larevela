// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * @title LaRevelaToken
 * @notice A simple ERC-20-like token for the LaRevela technical test.
 *         Demonstrates on-chain read (balanceOf) and write (transfer) operations.
 *
 */
contract LaRevelaToken {
    string public name = "LaRevela Token";
    string public symbol = "LRT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @param initialSupply Token amount minted to the deployer (in whole tokens,
     *        will be multiplied by 10^18 internally).
     */
    constructor(uint256 initialSupply) {
        uint256 amount = initialSupply * 10 ** decimals;
        totalSupply = amount;
        _balances[msg.sender] = amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    // ─── Write ────────────────────────────────────────────────────────────────

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "LRT: transfer amount exceeds allowance");
        _allowances[from][msg.sender] = currentAllowance - amount;
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Faucet: anyone can mint 100 LRT to themselves (test use only).
     */
    function faucet() public {
        uint256 amount = 100 * 10 ** decimals;
        totalSupply += amount;
        _balances[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "LRT: transfer from zero address");
        require(to != address(0), "LRT: transfer to zero address");
        require(_balances[from] >= amount, "LRT: insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }
}
