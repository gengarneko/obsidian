/*
 * @lc app=leetcode.cn id=47 lang=typescript
 * @lcpr version=
 *
 * [47] 全排列 II
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start
function permuteUnique(nums: number[]): number[][] {
	nums.sort((a, b) => a - b);
	const result: number[][] = [];
	const used = new Array(nums.length).fill(false);

	const backtrack = (path: number[] = []) => {
		if (path.length === nums.length) {
			result.push([...path]);
			return;
		}

		for (let i = 0; i < nums.length; i++) {
			if (used[i] || (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]))
				continue;

			used[i] = true;
			path.push(nums[i]);
			backtrack(path);
			path.pop();
			used[i] = false;
		}
	};

	backtrack();

	return result;
}
// @lc code=end

// @lcpr case=start
// [1,1,2]\n
// @lcpr case=end

// @lcpr case=start
// [1,2,3]\n
// @lcpr case=end
