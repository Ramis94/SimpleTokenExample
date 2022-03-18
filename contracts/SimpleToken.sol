pragma solidity ^0.8.0;

import "./IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is IERC20, Ownable {

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() override external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) override external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint amount) override external returns (bool) {
        address from = msg.sender;
        transferWithCheck(from, to, amount);
        return true;
    }

    function allowance(address owner, address spender) override public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint amount) override external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint amount
    ) override external returns (bool) {
        transferWithCheck(from, to, amount);
        uint256 currentAllowance = allowance(from, to);
        require(currentAllowance >= amount, "insufficient allowance");
        _allowances[from][to] = currentAllowance - amount;
        return true;
    }

    function transferWithCheck(address from, address to, uint256 amount) private {
        require(from != address(0), "transfer 'from' the zero address");
        require(to != address(0), "transfer 'to' the zero address");
        require(_balances[from] >= amount, "transfer amount exceeds balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function mint(uint amount) external onlyOwner {
        _balances[msg.sender] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external onlyOwner {
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
