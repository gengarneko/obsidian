## Doc - 新版用户手册

## DX - 升级前端工具链

### webpack 分析

```
# Webpack 配置分析

  

## 主要功能

  

### 基础配置

  

- 构建 cvat-ui app 这个基于 react 的项目配置

- 支持 development 和 production 两种构建模式，通过 argv.mode 进行判断

- 使用文件系统缓存来提升构建性能

  

### 入口和输出

  

- 入口文件：`./src/index.tsx`

- 输出文件：`dist`

- 生成文件：`assets` 目录，使用 `contenthash`

  

### 开发服务器

  

- 运行在 localhost:3000

- 支持热更新（Hot Module Replacement）

- 配置了服务器代理，将 API 请求转发到环境变量指定的后端服务

  

### 模块解析配置

  

- 支持 `.tsx`, `.ts`, `.jsx`, `.tsx` 文件

- 使用 TsconfigPathsPlugin 获取 tsconfig 文件中的别名配置

- 设置了多个路径别名

- 禁用了 nodejs 的 fs 模块

  

### 模块处理规则

  

- TypeScript/TSX 文件使用 babel-loader 处理，配置了多个 Babel 插件

- CSS/SCSS 文件使用 style-loader, css-loader, postcss-loader 和 sass-loader 处理

- SVG 文件使用 react-svg-loader 处理（vite 默认支持 svg 导入，作为 react 组件则使用 svgr）

- Web Worker 文件使用 worker-loader 处理，区分了第三方和自定义 worker

  

### 插件配置

  

- HtmlWebpackPlugin: 生成 HTML 文件

- Dotenv: 支持环境变量配置（vite 默认支持）

- CopyPlugin: 复制第三方 WebAssembly 文件

- TerserPlugin: 用于代码压缩（esbuild 压缩快 20-40 倍）
```

### package.json

```json
{
  "name": "cvat-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "check": "tsc -b",
    "dev": "vite",
    "build": "bun run check && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.0.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.7"
  },
  "devDependencies": {
    "@biomejs/biome": "1.9.4",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "sass": "^1.85.0",
    "typescript": "~5.7.2",
    "vite": "^6.1.0",
    "vite-plugin-svgr": "^4.3.0",
    "vite-plugin-wasm": "^3.4.1"
  }
}
```

### Runtime (node --> bun)


### Bundle (webpack4 --> vite)
webpack


### Linter (eslint --> biome)

从 eslint 生态切换到 biome，biome 本身内置了大多数

#### installation

```shell
# npm
npm install --save-dev --save-exact @biomejs/biome

# yarn
yarn add --dev --exact @biomejs/biome

# pnpm
pnpm add --save-dev --save-exact @biomejs/biome

# bun
bun add --dev --exact @biomejs/biome

# deno
deno add --dev npm:@biomejs/biome
```

#### configuration

init by command:

```shell
# npm
npx @biomejs/biome init

# yarn
yarn biome init

# pnpm
pnpm biome init

# bun
bunx biome init

# deno
deno run -A npm:@biomejs/biome init
```

`biome.json`:

```json
{
	"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
	"vcs": {
		"enabled": false,
		"clientKind": "git",
		"useIgnoreFile": false
	},
	"files": {
		"ignoreUnknown": false,
		"ignore": []
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "space"
	},
	"organizeImports": {
		"enabled": true
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double"
		}
	}
}
```

## Feat - dynamic algorithms setting