# epay-node-sdk

一款轻量的彩虹易支付（epay）Node.js SDK，封装了常用的支付与商户信息查询接口，便于在 Node.js 服务中快速集成支付能力。

## 说明

本仓库包含一个简单的 JavaScript 实现（`index.js`）和示例脚本（`demo.js`）。

> 提示：示例中的 `require('epay-node-sdk')` 是在将本包发布或通过 `npm link` 后使用的方式；在直接从仓库运行示例时，可将 `require('epay-node-sdk')` 替换为 `require('./index')`。

## 特性

- 发起二维码/直连下单（pay）
- 查询商户信息与结算规则（query）
- 查询/修改结算账号（settle / change）
- 查询单个或批量订单（order / orders）

## 要求

- Node.js（建议 >= 12）
- 依赖库：`request`、`request-promise`（示例使用）

## 安装（开发）

克隆仓库并安装依赖：

```bash
git clone <repo-url>
cd epay-node-sdk
npm install request request-promise
```

如果你想将本包作为全局或本地模块使用，可以在本地运行：

```bash
# 在开发目录中（可选）
npm link
# 在你的项目目录中
npm link epay-node-sdk
```

或者直接在示例中使用相对路径：

```js
const Epay = require('./index')
```

## 快速开始

下面是一个最小示例（推荐使用 async/await 或 Promise）：

```js
const Epay = require('./index') // 或 'epay-node-sdk'（已安装/链接时）

const epay = new Epay({
	domain: 'https://epay.example.com',
	pid: 1000,
	key: 'your-secret-key'
})

async function main() {
	try {
		// 发起支付
		const payConfig = {
			type: 'alipay',
			out_trade_no: Date.now().toString(),
			notify_url: 'https://your.site/notify',
			return_url: 'https://your.site/return',
			name: '测试商品',
			money: '0.01'
		}

		const payResult = await epay.pay(payConfig)
		console.log('payResult:', payResult)

		// 查询商户信息
		const info = await epay.query()
		console.log('merchant info:', info)
	} catch (err) {
		console.error('调用失败：', err)
	}
}

main()
```

注意：示例 `demo.js` 中有类似用法；如果直接运行 `demo.js`，请根据你的环境调整 `require` 路径或先执行 `npm link`。

## API 参考

类：Epay

构造函数

```js
new Epay({ domain, pid, key })
```

方法（均返回 Promise，部分接口在不可用时可能返回 HTML 字符串，请根据返回值判断）：

- query(): 查询商户信息与结算规则，正常返回 JSON 对象。
- change(account, username): 修改结算账号，返回 JSON 或（若商户关闭接口）HTML 字符串。
- settle(): 查询结算记录，返回 JSON。
- orders(): 批量查询订单，返回 JSON。
- order(out_trade_no): 查询指定商户订单，返回 JSON。
- pay(args): 二维码/下单接口，参数示例详见源码，返回 JSON 或 HTML（取决于下游返回）。

pay 方法常见参数（示例）

```js
{
	type: 'alipay',
	out_trade_no: '唯一订单号',
	notify_url: '异步通知地址',
	return_url: '支付完成跳转地址',
	name: '商品名称',
	money: '金额(元)'
}
```

签名与返回

SDK 内部会按照约定对参数进行排序并用 MD5 签名（见源码中的 sign 生成逻辑）。接口返回可能是 JSON（推荐）或 HTML 字符串（例如直接返回支付页面/表单），使用时请根据实际返回进行处理。

## 运行示例

若你想直接运行仓库内的 `demo.js`：

1. 安装依赖：`npm install request request-promise`
2. 修改 `demo.js` 中的 `require('epay-node-sdk')` 为 `require('./index')`（或先 `npm link`）
3. 运行：

```bash
node demo.js
```

示例脚本展示了如何发起支付、查询商户信息、修改结算账号、查询结算和订单等常用操作。示例中有部分调用返回 Promise，请使用 then/catch 或 async/await 进行处理。

## 常见问题与注意事项

- 如果接口返回的是 HTML（例如 change 接口被关闭时），SDK 会返回该原始字符串，请根据需要在上层作解析或展示。
- `request`/`request-promise` 在未来可能已不再维护，若要长期使用建议替换为 `node-fetch` 或 `axios` 并做小规模改造。
- 请确保 `domain` 带协议（http:// 或 https://）。

## 贡献

欢迎提交 issue 或 PR。建议提交内容：

- 修复 bug
- 增加单元测试或示例
- 将依赖替换为更现代的 HTTP 客户端并保留向后兼容接口
