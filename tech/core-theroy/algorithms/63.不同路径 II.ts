/*
 * @lc app=leetcode.cn id=63 lang=typescript
 * @lcpr version=
 *
 * [63] 不同路径 II
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start
function uniquePathsWithObstacles(obstacleGrid: number[][]): number {
	const m = obstacleGrid.length;
	const n = obstacleGrid[0].length;

	if (obstacleGrid[0][0] === 1) return 0;

	const dp = new Array(m).fill(0).map(() => new Array(n).fill(0));

	dp[0][0] = 1;

	console.log("xxxxxxxxx", dp);

	// init first row
	for (let j = 1; j < n; j++) {
		if (obstacleGrid[0][j] === 0) {
			dp[0][j] = dp[0][j - 1];
		}
	}

	// init first col
	for (let i = 1; i < m; i++) {
		if (obstacleGrid[i][0] === 0) {
			dp[i][0] = dp[i - 1][0];
		}
	}

	// 动态规划填充其余位置
	for (let i = 1; i < m; i++) {
		for (let j = 1; j < n; j++) {
			// 如果当前位置没有障碍物
			if (obstacleGrid[i][j] === 0) {
				// 当前位置的路径数 = 上方位置的路径数 + 左方位置的路径数
				dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
			}
			// 如果有障碍物，dp[i][j]保持为0
		}
	}

	return dp[m - 1][n - 1];
}
// @lc code=end

/*
// @lcpr case=start
// [[0,0,0],[0,1,0],[0,0,0]]\n
// @lcpr case=end

// @lcpr case=start
// [[0,1],[0,0]]\n
// @lcpr case=end

 */
