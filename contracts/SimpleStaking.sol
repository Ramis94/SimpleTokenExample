pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";


contract SimpleStaking is Ownable {

    event Stake(address indexed from, uint256 amount);
    event Claim(address indexed to, uint256 amount);
    event Unstake(address indexed from, uint256 amount);

    struct Staker {
        uint256 balance;
        uint256 startStakeTimestamp;
        uint256 claimedReward;
    }

    using SafeERC20 for IERC20;
    mapping(address => Staker) public stakers;
    IERC20 private stakingToken;
    string private name;

    uint256 freezingTime = 20 minutes;
    uint256 totalStaked;
    uint8 percent = 20;

    constructor(string memory _name, address _stakingToken) {
        name = _name;
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) public {
        require(amount > 0, "SimpleStaking: Cannot stake nothing");
        Staker storage staker = stakers[_msgSender()];
        if (staker.balance > 0) {
            staker.claimedReward += calculateYieldTotal(staker);
        }
        stakingToken.safeTransferFrom(
            _msgSender(),
            address(this),
            amount
        );
        totalStaked += amount;
        staker.startStakeTimestamp = block.timestamp;
        staker.balance += amount;
        emit Stake(_msgSender(), amount);
    }

    function claim() public {
        Staker storage staker = stakers[_msgSender()];
        require(block.timestamp > staker.startStakeTimestamp + 10 minutes,
            "SimpleStaking: function claim will be available 10 minutes after the start stake"
        );
        uint256 toTransfer = calculateYieldTotal(staker);
        if (staker.claimedReward > 0) {
            toTransfer += staker.claimedReward;
            staker.claimedReward = 0;
        }
        stakingToken.transfer(_msgSender(), toTransfer);
        emit Claim(_msgSender(), toTransfer);
    }

    function unstake() public {
        Staker storage staker = stakers[_msgSender()];
        require(staker.balance > 0, "SimpleStaking: Nothing to unstake");
        require(block.timestamp >= staker.startStakeTimestamp + freezingTime,
            "SimpleStaking: function unstake will be available"
        );
        stakingToken.safeTransfer(_msgSender(), staker.balance);
        emit Unstake(_msgSender(), staker.balance);
        staker.balance = 0;
    }

    function calculateYieldTotal(Staker memory staker) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - staker.startStakeTimestamp;
        if (timeStaked < 10 minutes) {
            return 0;
        }
        return staker.balance * percent * timeStaked / 365 days / 100;
    }

    function updateFreezingTime(uint _time) public onlyOwner {
        freezingTime = _time;
    }

    function updatePercent(uint8 _percent) public onlyOwner {
        percent = _percent;
    }
}
