支付集成Skill
支付集成Skill
产品介绍
支付宝通过将核心支付能力标准化封装为 Skill 组件，实现了支付接入文档的 AI 全文可读。开发者无需处理复杂的底层逻辑，仅需通过自然语言描述即可在 Vibe Coding 模式下快速构建商业闭环，让支付集成进入 开箱即用 的智能时代。
注意事项 
1、向 AI 描述需求时，尽量明确支付场景（如 电脑网站支付、小程序支付），避免模糊表述导致偏差。
2、AI 生成的接入代码，开发者请务必审查代码，需自行确认代码逻辑。
3、支付宝支付产品迭代后 Skill 会同步更新，建议定期重新执行安装命令获取最新版本。
适用场景
开发者在 Vibe Coding 模式下构建有商业化闭环需求的应用。
开发者如何使用产品
前置条件
条件
说明
支付宝账号
企业 或 个人账号 均可
开发者工具
支持 Vibe Coding 
npm工具
操作步骤
第一步：下载、安装Skill 
方式一：通过客户端安装
点击 一键打开 Qoder客户端安装


，可为开发者复制 Skill 安装指令并唤起 Qoder 客户端。
注意：
Qoder 客户端版本号应不低于 0.12.2。
Qoder 客户端已安装但未打开的情况下，通过超链有可能无法唤起，届时开发者可手动打开 Qoder 客户端后再次点击超链。
方式二：通过 npx 下载
npx @alipay/alipay-payment-integration install
方式三：通过 github 获取
https://github.com/alipay/ai/tree/main/skills/alipay-payment-integration


 
方式四：通过 魔搭 市场下载
进入 魔搭Skill中心


，查找 支付宝支付集成Skill，进入 Skill 详情页下载。
使用提示
采用开放的 SKILL.md 标准，兼容 Claude Code等工具，跨平台通用。 
将下载到本地的 skill 文件夹复制到 项目路径/.claude/skills/ 
第二步：描述支付需求，等待 AI 自动编写代码
用自然语言告诉 AI 你要做什么：
场景
示例 
电脑网站收款
"我要做一个电脑网站，用户可以下单并用支付宝付款"
手机APP收款
"帮我集成支付宝APP支付，用户点击按钮就能拉起支付宝"
第三步：沙箱调试
使用支付集成Skill 时，支付宝会对开发者自动分配快速沙箱和测试账号，并展示在会话中。开发者无需注册/登录支付宝账号即可获得沙箱环境信息，直接用于沙箱测试。
注意：沙箱环境仅用于测试，不涉及真实资金。如需应用正式上线并具备实际收款能力，须开发者进一步申请正式商家账号，签约支付产品，并将沙箱密钥信息替换为正式密钥（如何创建真实应用，请参考：网页/移动应用文档指引、小程序应用文档指引）
接入声明 
请开发者在接入前仔细阅读并遵守如下声明 
平台免责：开发者应自行选择合法合规的 AI 工具，严格遵循所选 AI 工具的版权规定及使用规范。我们不对因使用本 Skill 文档生成的代码所导致的任何问题承担责任，包括但不限于法律纠纷、第三方索赔、系统运行异常等。 
使用责任：我方不对使用本 Skill 的效果、正确性、安全性做任何担保。使用本Skill文档自动生成的代码，开发者在使用过程中应自行审核、测试并确保其适用性与准确性。因代码错误、不兼容或使用不当所引发的任何直接或间接损失，包括但不限于经济损失、数据丢失、系统故障等，均由开发者自行承担全部责任。 
使用前提：正式接入本 Skill 前，开发者应充分理解并接受其使用风险，务必完成全场景测试与验证，确保支付集成的适配性、稳定性和安全性。 
安全提示：开发者有义务保障凭证安全，禁止将任何包含敏感信息（包括但不限于：设备 ID、账号、密码、API Keys 或私钥（Private Keys）等）的文件直接编码在代码中，或提交至任何公网环境。因敏感信息泄露、系统遭受攻击等情形产生的相关责任由开发者自行承担。 
合规提示：开发者应确保其接入行为、业务场景符合相关法律法规及行业规范，严格遵循《网络安全法》《数据安全法》《个人信息保护法》及支付行业监管要求。 
版权声明：本 Skill 文档的版权归属我方所有，开发者不得擅自篡改、传播、转售、出租本文档，不得用于与接入支付宝支付服务无关的其他用途。如开发者存在前述违规使用行为，我方有权追究法律责任。 
开发者使用本 Skill 即视为已充分理解并同意本声明的全部内容，同意按照上述方式收集、使用其信息。如开发者不同意本声明，请立即停止使用本 Skill。
官方用户交流群
钉钉群：入群链接 支付集成Skill交流 | 支付宝官方群


 钉钉群号：182405001188 

Alipay OpenAPI SDK
NPM version CI Test coverage npm download

简介
Alipay OpenAPI SDK for Node.js / 用于给 Node.js 服务器提供调用支付宝开放平台的能力。 包括向支付宝服务器发起 OpenAPI 请求、订单信息生成，以及配套的证书、加签和验签能力。

基于支付宝 API v3 接口规范实现。

同时支持 Commonjs 和 ESM 两种模块依赖方式引入，通过 TypeScript 实现，HTTP Client 使用 urllib。

环境要求
需要 Node.js >= 18.20.0
安装依赖

npm install alipay-sdk --save
平台配置
先前往支付宝开发平台-开发者中心完成开发者接入的一些准备工作，包括创建应用、为应用添加功能包、设置应用的接口加签方式等。
可以使用 支付宝开放平台秘钥工具 获取所需的公私钥，并在平台上上传公钥。
本 SDK 默认采用 PKCS1 的格式解析密钥，与密钥工具的默认生成格式不一致。 请使用密钥工具【格式转换】功能转为 PKCS1，或在本 SDK 初始化时显式指定 keyType: 'PKCS8'。
在设置加签方式结束之后，记录必要信息用于初始化 SDK。
公钥证书模式（推荐）： appId、应用私钥、应用公钥证书文件、支付宝公钥证书文件、支付宝根证书文件
公钥模式：appId、应用私钥、应用公钥、支付宝公钥
初始化 SDK
代码示例中的路径和文件名仅做示范，请根据项目实际读取文件所在的位置
请保存好私钥文件，避免信息泄露
普通公钥模式
import { AlipaySdk } from 'alipay-sdk';

// 实例化客户端
const alipaySdk = new AlipaySdk({
  // 设置应用 ID
  appId: 'your-APPID',
  // 设置应用私钥
  privateKey: fs.readFileSync('/path/to/private-key.pem', 'ascii'),
  // 设置支付宝公钥
  alipayPublicKey: fs.readFileSync('/path/to/alipay-public-key.pem', 'ascii'),
  // 密钥类型，请与生成的密钥格式保持一致，参考平台配置一节
  // keyType: 'PKCS1',
  // 设置网关地址，默认是 https://openapi.alipay.com
  // endpoint: 'https://openapi.alipay.com',
});
证书模式
import { AlipaySdk } from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: '2016123456789012',
  privateKey: fs.readFileSync('/path/to/private-key.pem', 'ascii'),
  // 传入支付宝根证书、支付宝公钥证书和应用公钥证书。
  alipayRootCertPath: '/path/to/alipayRootCert.crt',
  alipayPublicCertPath: '/path/to/alipayCertPublicKey_RSA2.crt',
  appCertPath: '/path/to/appCertPublicKey.crt',
});
验证配置
可以使用如下基础接口请求服务端，以验证配置正确。

// https://opendocs.alipay.com/open-v3/668cd27c_alipay.user.deloauth.detail.query?pathHash=3ab93168
const result = await alipaySdk.curl('POST', '/v3/alipay/user/deloauth/detail/query', {
  body: {
    date: '20230102',
    offset: 20,
    limit: 1,
  },
});

console.log(result);
只要接口调用返回 responseHttpStatus 200，即代表验证配置成功

{
  data: {},
  responseHttpStatus: 200,
  traceId: '06033316171731016275628924348'
}
其余情况，如代码报错，则说明未配置成功。

快速使用
curl 示例代码
用于向支付宝服务器发起请求，与具体接口相关的业务参数。 下面以 统一收单交易支付接口 为示例

const result = await alipaySdk.curl('POST', '/v3/alipay/trade/pay', {
  body: {
    notify_url: 'http://www.your-notify.com/notify', // 通知回调地址
    out_trade_no: '商家的交易码，需保持唯一性',
    total_amount: '0.1',
    subject: '测试订单',
    // 更多参数请查看文档 https://opendocs.alipay.com/open-v3/08c7f9f8_alipay.trade.pay?scene=32&pathHash=8bf49b74
  }
});

console.log(result);
// {
//  "trade_no":"2013112011001004330000121536",
//  "out_trade_no":"6823789339978248",
//  "buyer_logon_id":"159****5620",
//  "total_amount":"120.88",
//  ...
使用 AlipayFormData 表单上传文件
部分接口需要上传文件。 SDK 内部封装了一个 Form 对象，用以在发起 multipart/form-data 请求时使用。 以 支付宝文件上传接口 为例：

import { AlipayFormData } from 'alipay-sdk';

const form = new AlipayFormData();
form.addFile('file_content', '图片.jpg', path.join(__dirname, './test.jpg'));

const uploadResult = await alipaySdk.curl<{
  file_id: string;
}>('POST', '/v3/alipay/open/file/upload', {
  form,
  body: {
    biz_code: 'openpt_appstore',
  },
});

console.log(uploadResult);
// {
//   data: { file_id: 'A*7Cr9T6IAAC4AAAAAAAAAAAAAATcnAA' },
//   responseHttpStatus: 200,
//   traceId: '06033316171731110716358764348'
// }
上传文件流
import fs from 'node:fs';
import { AlipayFormData } from 'alipay-sdk';

const form = new AlipayFormData();
form.addFile('file_content', '图片.jpg', fs.createReadStream('/path/to/test-file'));

const uploadResult = await alipaySdk.curl<{
  file_id: string;
}>('POST', '/v3/alipay/open/file/upload', {
  form,
  body: {
    biz_code: 'openpt_appstore',
  },
});

console.log(uploadResult);
// {
//   data: { file_id: 'A*7Cr9T6IAAC4AAAAAAAAAAAAAATcnAA' },
//   responseHttpStatus: 200,
//   traceId: '06033316171731110716358764348'
// }
上传文件内容
import fs from 'node:fs';
import { AlipayFormData } from 'alipay-sdk';

const form = new AlipayFormData();
form.addFile('file_content', '图片.jpg', fs.readFileSync('/path/to/test-file'));

const uploadResult = await alipaySdk.curl<{
  file_id: string;
}>('POST', '/v3/alipay/open/file/upload', {
  form,
  body: {
    biz_code: 'openpt_appstore',
  },
});

console.log(uploadResult);
// {
//   data: { file_id: 'A*7Cr9T6IAAC4AAAAAAAAAAAAAATcnAA' },
//   responseHttpStatus: 200,
//   traceId: '06033316171731110716358764348'
// }
pageExecute 示例代码
pageExecute 方法主要是用于网站支付接口请求链接生成，传入前台访问输入密码完成支付， 如电脑网站支付 alipay.trade.page.pay 等接口。

表单示例：

const bizContent = {
  out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
  product_code: "FAST_INSTANT_TRADE_PAY",
  subject: "abc",
  body: "234",
  total_amount: "0.01"
};

// 支付页面接口，返回 HTML 代码片段，内容为 Form 表单
const html = alipaySdk.pageExecute('alipay.trade.page.pay', 'POST', {
  bizContent,
  returnUrl: 'https://www.taobao.com'
});
<form action="https://openapi.alipay.com/gateway.do?method=alipay.trade.app.pay&app_id=2021002182632749&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2023-02-28%2011%3A48%3A28&app_auth_token=202302BBbcfad868001a4df3bbfa99e8a6913F10&sign=j9DjDGgxLt3jbOQZy7q7Qu8baKWTl4hZlxOHa%2B46hC1djmFx%2FIyBqzQntPMurzz3f8efXJsalZz3nqZ9ClowCCxBfBvqE0cdzCDAeQ1GMgjd7dbWgjfNNcqKgmJPsIkLaHnP5vTvj%2BA27SqkeZCMbeVfv%2B4nYurXaFB9dNBtA%3D%3D" method="post" name="alipaySDKSubmit1677556108819" id="alipaySDKSubmit1677556108819">
    <input type="hidden" name="alipay_sdk" value="alipay-sdk-nodejs-3.3.0" />
    <input type="hidden" name="biz_content" value="{&quot;out_trade_no&quot;:&quot;ziheng-test-eeee&quot;,&quot;product_code&quot;:&quot;QUICK_MSECURITY_PAY&quot;,&quot;subject&quot;:&quot;订单标题&quot;,&quot;total_amount&quot;:&quot;0.01&quot;,&quot;body&quot;:&quot;订单描述&quot;}" />
</form>
<script>document.forms["alipaySDKSubmit1677556108819"].submit();</script>
支付链接示例：

// 支付页面接口，返回支付链接，交由用户打开，会跳转至支付宝网站
const url = sdk.pageExecute('alipay.trade.page.pay', 'GET', {
  bizContent,
  returnUrl: 'https://www.taobao.com'
});

// 返回示例：https://openapi.alipay.com/gateway.do?method=alipay.trade.app.pay&app_id=2021002182632749&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2023-02-28%2011%3A46%3A35&app_auth_token=202302BBbcfaf3bbfa99e8a6913F10&sign=TPi33NcaKLRBLJDofon84D8itMoBkVAdJsfmIiQDScEw4NHAklXvcvn148A2t47YxDSK0urBnhS0%2BEV%2BVR6h6aKgp931%2FfFbG1I3SAguMjMbr23gnbS68d4spcQ%3D%3D&alipay_sdk=alipay-sdk-nodejs-3.3.0&biz_content=blabla
sdkExecute 示例代码
sdkExecute 方法主要是服务端生成请求字符串使用的，不会直接支付扣款，需传值到客户端进行调用收银台输入密码完成支付， 如 App 支付接口 alipay.trade.app.pay。

// App 支付接口，生成请求字符串，
const orderStr = sdk.sdkExecute('alipay.trade.app.pay', {
  bizContent: {
    out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
    product_code: "FAST_INSTANT_TRADE_PAY",
    subject: "abc",
    body: "234",
    total_amount: "0.01"
},
  returnUrl: 'https://www.taobao.com'
});

console.log(orderStr);
// method=alipay.trade.app.pay&app_id=2021002182632749&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2023-02-24%2016%3A20%3A28&app_auth_token=202302BBbcfad868001a4df3bbfa99e8a6913F10&sign=M%2B2sTNATtUk3i8cOhHGtqjVDHIHSpPReZgjfLfIgbQD4AvI%2Fh%2B%2FS2lkqfJVnI%2Bu0IQ2z7auE1AYQ0wd7yPC4%2B2m5WnN21Q6uQhCCHOsg30mXdnkdB3rgXIiFOSuURRwnaiBmKNKdhaXel51fxYZOTOApV47K6ZUsOlPxc%2FVJWUnC7Hrl64%2BAKqtbv%2BcaefzapYsJwGDzMAGccHGfxevSoZ2Ev7S0FsrDe4LBx4m%2BCWSIFASWFyWYxJq%2BJg7LH1HJqBdBk1jjh5JJ3bNlEqJk8MEFU7sNRae2ErdEPOwCchWkQOaVGOGpFlEHuTSvxnAKnjRkFerE14v%2BVm6weC1Tbw%3D%3D&alipay_sdk=alipay-sdk-nodejs-3.2.0&biz_content=%7B%22out_trade_no%22%3A%22ziheng-test-eeee%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%2C%22subject%22%3A%22%E8%AE%A2%E5%8D%95%E6%A0%87%E9%A2%98%22%2C%22total_amount%22%3A%220.01%22%2C%22body%22%3A%22%E8%AE%A2%E5%8D%95%E6%8F%8F%E8%BF%B0%22%7D

// 返回支付宝客户端之后，在【小程序中】通过 my.tradePay 进行调用。
// 详见：https://opendocs.alipay.com/mini/api/openapi-pay
my.tradePay({
  // 服务端生成的字符串，即上面返回的 orderStr
  orderStr,
  success: (res) => {
    my.alert({
      content: JSON.stringify(res),
    });
  },
  fail: (res) => {
    my.alert({
      content: JSON.stringify(res),
    });
  }
});
exec 示例代码（已废弃，请使用 curl 代替）
用于向支付宝服务器发起请求。与具体接口相关的业务参数，需要放在 bizContent 中。

const result = await alipay.exec('alipay.trade.pay', {
  notify_url: 'http://www.your-notify.com/notify', // 通知回调地址
  bizContent: {
    out_trade_no: '商家的交易码，需保持唯一性',
    total_amount: '0.1',
    subject: '测试订单',
  }
});
⚠️⚠️⚠️ 注意：部分接口的请求参数不在 bizContent 中， 如 alipay.system.oauth.token， 具体可参考官网各接口定义。

通知验签
部分接口会设置回调地址，用于支付宝服务器向业务服务器通知业务情况（如交易成功）等。 此时业务服务应该验证该回调的来源安全性，确保其确实由支付宝官方发起。 SDK 提供了对应的通知验签能力。

// 获取 queryObj，如 ctx.query, router.query
// 如服务器未将 queryString 转化为 object，需要手动转化
const queryObj = {
  sign_type: 'RSA2',
  sign: 'QfTb8tqE1BMhS5qAn.....',
  gmt_create: '2019-08-15 15:56:22',
  other_biz_field: '....',
}

// true | false
const success = sdk.checkNotifySign(queryObj);
如果遇到验签失败，请尝试使用 checkNotifySignV2() 方法代替，它默认不会对 value 进行 decode 如 https://github.com/alipay/alipay-sdk-nodejs-all/issues/45 提到的常见问题。

const postData = {
  sign_type: 'RSA2',
  sign: 'QfTb8tqE1BMhS5qAn.....',
  gmt_create: '2019-08-15 15:56:22',
  other_biz_field: '....',
};

// true | false
const success = sdk.checkNotifySignV2(postData);
对加密内容进行解密
例如需要对小程序拿到的加密手机号码进行解密

const plainText = alipaySdk.aesDecrypt(getPhoneNumberResponse);
对前端返回的报文进行验签
参考 https://opendocs.alipay.com/common/02mse3#AES%20%E8%A7%A3%E5%AF%86%E5%87%BD%E6%95%B0 的算法

前端返回的内容

{
 "response": "hvDOnibG0DPcOFPNubK3DEfLQGL4=",
 "sign": "OIwk7zfZMp5GX78Ow==",
 "sign_type": "RSA2",
 "encrypt_type": "AES",
 "charset": "UTF-8"
}
通过 alipay-sdk 验签

// 注意，加密内容必须前后加上双引号
const signContent = '"hvDOnibG0DPcOFPNubK3DEfLQGL4="';
const sign = 'OIwk7zfZMp5GX78Ow==';
const signType = 'RSA2';
const signCheckPass = alipaySdk.rsaCheck(signContent, sign, signType);

console.log(signCheckPass);
通过 HTTP 代理服务器调用
在需要固定 IP 白名单调用的场景下，可以通过配置 config.proxyAgent 来指定 HTTP 代理服务器调用。

import { AlipaySdk, ProxyAgent } from 'alipay-sdk';

// 实例化客户端
const alipaySdk = new AlipaySdk({
  // 其他配置不展示
  // ...
  proxyAgent: new ProxyAgent('http(s)://your-http-proxy-address'),
});

// 后续的所有 http 调用都会走此 HTTP 代理服务器
const result = await alipaySdk.curl('POST', '/v3/alipay/user/deloauth/detail/query', {
  body: {
    date: '20230102',
    offset: 20,
    limit: 1,
  },
});

console.log(result);
alipay-sdk v3 到 v4 的升级说明
从 v3 到 v4 有以下不兼容变更，请参考示例代码进行更新

Node.js 需要升级到 >= 18.20.0 及以上版本，可以到 Node.js 官方网站下载更新

Commonjs 通过 require('alipay-sdk') 引入细微变化

v3 是会直接导出到 module.exports 下

const AlipaySdk = require('alipay-sdk');
v4 是导出到 exports.AlipaySdk 下

const { AlipaySdk } = require('alipay-sdk');
exec() 方法如果传递 options.formData 不包含文件，会抛出 TypeError 异常 提示使用 pageExec() 方法代替

打印调试日志的方式
通过 NODE_DEBUG 环境变量打印 alipay-sdk 相关的调试日志

NODE_DEBUG=alipay-sdk* node your-script.js
问题反馈
如您在使用 Alipay SDK for Node.js 过程中遇到问题， 欢迎前往 支付宝开放社区 发帖与支付宝工作人员和其他开发者一起交流， 或联系 支付宝开放平台客服 协助解决。

API
new AlipaySdk(config)
Param	Type	Description
config	AlipaySdkConfig	初始化 SDK 配置
AlipaySdkConfig
参数	说明	类型	必填
appId	应用ID	string	是
privateKey	应用私钥字符串。RSA 签名验签工具	string	是
signType	签名种类，默认值是 "RSA2"	"RSA2" | "RSA"	否
alipayPublicKey	支付宝公钥（需要对返回值做验签时候必填，不填则会忽略验签）	string	否
gateway	网关	string	否
timeout	网关超时时间（单位毫秒），默认值是 5000	number	否
camelcase	是否把网关返回的下划线 foo_bar 转换为驼峰写法 fooBar，默认值是 true	boolean	否
keyType	指定 privateKey 类型, 默认值是 "PKCS1"	"PKCS1" | "PKCS8"	否
appCertPath	应用公钥证书文件路径	string	否
appCertContent	应用公钥证书文件内容	string | Buffer	否
appCertSn	应用公钥证书sn	string	否
alipayRootCertPath	支付宝根证书文件路径	string	否
alipayRootCertContent	支付宝根证书文件内容	string | Buffer	否
alipayRootCertSn	支付宝根证书sn	string	否
alipayPublicCertPath	支付宝公钥证书文件路径	string	否
alipayPublicCertContent	支付宝公钥证书文件内容	string | Buffer	否
alipayCertSn	支付宝公钥证书sn	string	否
encryptKey	AES 密钥，调用 AES加 解密相关接口时需要	string	否
wsServiceUrl	服务器地址	string	否
alipaySdk.curl<T = any>(httpMethod, path, options?) ⇒ Promise<AlipayCommonResult<T>>
curl 方式调用支付宝 API v3 协议接口

Returns: Promise<AlipayCommonResult<T>> - 请求执行结果

Param	Type	Description	Required
httpMethod	string	HTTP 请求方式，支持 GET, POST, PUT, DELETE 等	是
path	string	HTTP 请求 URL	是
options	AlipayCURLOptions	可选参数	否
options.query	Record<string, string | number>	指该参数需在请求 URL 传参	否
options.body	Record<string, any>	指该参数需在请求 JSON 传参	否
options.form	AlipayFormData | AlipayFormStream	表单方式提交数据	否
options.requestId	string	调用方的 requestId，不填会默认生成 uuid v4	否
options.needEncrypt	boolean	自动 AES 加解密，默认值是 false	否
options.appAuthToken	string	应用授权令牌，代商家调用支付宝开放接口必填	否
options.requestTimeout	number	请求超时时间，默认使用 config.timeout	否
AlipayCommonResult<T>
响应结果

参数	说明	类型	必须
data	HTTP 接口响应返回的 JSON 数据	T	是
responseHttpStatus	HTTP 接口响应状态码	number	是
traceId	HTTP 接口响应 trace id	string	是
alipaySdk.sdkExecute(method, bizParams, options?) ⇒ string
生成请求字符串，用于客户端进行调用

Returns: string - 请求字符串

Param	Type	Description
method	string	方法名
bizParams	IRequestParams	请求参数
bizParams.bizContent	object	业务请求参数
options	ISdkExecuteOptions	可选参数
options.bizContentAutoSnakeCase	boolean	对 bizContent 做驼峰参数转为小写 + 下划线参数，如 outOrderNo => out_order_no，默认 true，如果不需要自动转换，请设置为 false
alipaySdk.pageExecute(method, httpMethod, bizParams) ⇒ string
生成网站接口请求链接 URL 或 POST 表单 HTML

Returns: string - 请求链接 URL 或 POST 表单 HTML

Param	Type	Description
method	string	方法名
httpMethod	string	后续进行请求的方法。如为 GET，即返回 http 链接；如为 POST，则生成表单 HTML
bizParams	IRequestParams	请求参数
bizParams.bizContent	object	业务请求参数
deprecated alipaySdk.exec(method, bizParams, options) ⇒ Promise<AlipaySdkCommonResult>
执行请求，调用支付宝 API v2 协议接口

注意：此方法是为了让 alipay-sdk@3 尽量平滑升级到 alipay-sdk@4 保留， 请尽快使用 alipaySdk.curl() 代替，走 API v3 协议。

Returns: Promise<AlipaySdkCommonResult> - 请求执行结果

Param	Type	Description
method	string	调用接口方法名，比如 alipay.ebpp.bill.add
bizParams	IRequestParams	请求参数
bizParams.bizContent	object	业务请求参数
options	IRequestOption	选项
options.validateSign	Boolean	是否验签
options.log	object	可选日志记录对象
AlipaySdkCommonResult
响应结果

参数	说明	类型	必须
code	响应码。10000 表示成功，其余详见 https://opendocs.alipay.com/common/02km9f	string	是
msg	响应讯息。Success 表示成功。	string	是
sub_code	错误代号	string	否
sub_msg	错误辅助信息	string	否
IRequestParams
请求参数

参数	说明	类型	必须
bizContent	业务请求参数	object	否
needEncrypt	自动 AES 加解密	boolean	否
alipaySdk.checkNotifySignV2(postData)
通知验签，默认不会对 value 进行 decode

Returns: Boolean - 是否验签成功

Param	Type	Description
postData	JSON	服务端的消息内容
alipaySdk.checkNotifySign(postData, raw)
通知验签

Returns: Boolean - 是否验签成功

Param	Type	Description
postData	JSON	服务端的消息内容
raw	Boolean	是否使用 raw 内容而非 decode 内容验签
alipaySdk.aesDecrypt(encryptedText)
对加密内容进行 AES 解密

Returns: String - 解密后的明文字符串

Param	Type	Description
encryptedText	String	加密内容字符串
