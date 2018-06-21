module.exports = {
  fixNum: function(num) {
    const retVal = Number.parseFloat(num).toFixed(2);
    return retVal;
  },
  mean: function(nums) {
    const sum = nums.reduce((a, b) => a + b);
    return sum / nums.length;
  },
  median: function(nums) {
    return nums[Math.round(nums.length/2)];
  }
};