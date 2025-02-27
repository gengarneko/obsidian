/*
 * @lc app=leetcode.cn id=59 lang=typescript
 * @lcpr version=
 *
 * [59] 螺旋矩阵 II
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start
function generateMatrix(n: number, order = "clockwise"): number[][] {
	const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

	let left = 0;
	let right = n - 1;
	let top = 0;
	let bottom = n - 1;

	let num = 1;

	while (num <= n * n) {
		for (let i = left; i <= right; i++) {
			matrix[top][i] = num++;
		}
		top++;

		for (let i = top; i <= bottom; i++) {
			matrix[i][right] = num++;
		}
		right--;

		for (let i = right; i >= left; i--) {
			matrix[bottom][i] = num++;
		}
		bottom--;

		for (let i = bottom; i >= top; i--) {
			matrix[i][left] = num++;
		}
		left++;
	}

	return matrix;
}
// @lc code=end

/*
// @lcpr case=start
// 3\n
// @lcpr case=end

// @lcpr case=start
// 1\n
// @lcpr case=end

 */
