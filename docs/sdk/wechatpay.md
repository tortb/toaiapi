## 一、概述

本 Skill 为接入微信支付基础支付的开发者提供了一站式的智能辅助能力，包括支付方式选型、示例代码检索、业务知识查询、接入质量评估和问题排查。开发者在支持 Skill 的 AI IDE 中打开项目，通过对话即可获得接入过程中的指引与帮助。[GitHub仓库地址](https://github.com/wechatpay-apiv3/wechatpay-skills)

## 二、快速开始

引入方式：

Clone 本仓库或下载 Skill 目录，将其放置到你项目中对应 AI IDE 的 Skill 配置目录下。

方式一：命令行加载

在项目根目录下执行以下命令，自动完成 Skill 的下载和配置：

```
npx skills add https://github.com/wechatpay-apiv3/wechatpay-skills --yes
```

方式二：Clone 仓库

直接 Clone 本仓库，用支持 Skill 的 IDE 打开项目即可使用：

```
git clone https://github.com/wechatpay-apiv3/wechatpay-skills.git
```

方式三：手动复制目录

如果你已有项目，将 Skill 目录复制到项目中对应 AI IDE 的 Skill 配置目录下即可。

以 Cursor 为例，将 Skill 目录复制到项目根目录的 `.cursor/skills/` 下：

```
your-project/
└── .cursor/
    └── skills/
        └── wechatpay-basic-payment/
            ├── SKILL.md
            └── references/
```

不同 AI IDE 的 Skill 配置目录可能不同，请参考对应 IDE 的文档。

验证是否生效：

打开 AI IDE 对话，输入"我要接入基础支付"。如果 Skill 已生效，助手会主动询问你的接入模式（商户模式还是服务商模式），而不是给出泛泛的回答。

## 三、能力说明

### 3.1、支付方式选型

不确定该用哪种支付方式时，描述你的业务场景，Skill 会从客户端环境（App / 微信内 / 浏览器 / PC）、支付体验（拉起收银台 / 扫码 / 付款码）、是否涉及多商户合单等维度进行匹配，覆盖 JSAPI、APP、H5、Native、小程序、付款码及合单支付。

示例对话：

```
"我的业务是在微信公众号里收款，应该用哪种支付方式？"

"我要在 App 里集成微信支付，用什么方式？"

"合单支付和普通支付有什么区别？什么场景需要用合单？"
```

### 3.2、示例代码检索

需要接入代码时，Skill 会先确认你的接入模式（商户/服务商）和开发语言，然后从仓库中检索对应接口的代码示例。所有代码都是预先编写并验证过的，不是 AI 实时生成的。

示例对话：

```
"帮我生成 JSAPI 下单的 Java 代码"

"我要调用退款接口，用 Go 语言"

"支付回调通知怎么处理？"
```

### 3.3、业务知识速查

接入过程中遇到概念不清、参数不明、流程不熟的问题，直接提问即可。

示例对话：

```
"APPID 需要怎么绑定？"

"订单的状态流转是怎样的？"

"退款有什么规则和限制？"
```

### 3.4、接入质量评估

开发完成准备上线时，可以让 Skill 做一次全面检查。检查范围包括：签名验签是否按标准实现、业务逻辑是否完整、回调处理是否规范。

示例对话：

```
"帮我检查一下代码有没有接入隐患"

"我准备上线了，帮我做个质量评估"
```

### 3.5、接口排障

接口报错时，提供 Response Header 中的 `Request-Id`，Skill 会自动提取错误码并匹配排查方案。排障完成后会推荐做一次接入质量评估，排查其他潜在问题。

示例对话：

```
"下单接口签名报错了，Request-Id 是 08F16BEF7B2D64C6E064BAE219CF05-268443699"

"调起支付时报 appid 和 mch_id 不匹配怎么办？"

"支付回调一直收不到是什么原因？"
```

## 四、常见问题

### Q：示例代码支持哪些开发语言？

A：目前支持 Java 和 Go。

### Q：我的 IDE 不支持 Skill 怎么办？

A：可以直接阅读仓库中的示例代码和参考文档来完成接入。参考文档位于 references/ 目录下。


>更新时间：2026.04.24

## 微信 OpenSDK

微信 OpenSDK 是微信为开发者提供的客户端 SDK。通过微信 OpenSDK，你可以使用微信客户端的支付能力，如调起微信支付。

| SDK | 说明 |
| --- | --- |
| [JS-SDK](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html) | 微信网页 JS-SDK |
| [小程序](https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html) | 小程序 API |
| [iOS](https://developers.weixin.qq.com/doc/oplatform/Downloads/iOS_Resource.html) | iOS 开发工具包 |
| [Android](https://developers.weixin.qq.com/doc/oplatform/Downloads/Android_Resource.html) | Android 开发工具包 |

## 服务端 SDK

微信支付提供了多种编程语言的开源服务端 SDK，以帮助开发者快速、高效地接入微信支付功能:

| 编程语言 | 源代码 | 软件包仓库 |
| --- | --- | --- |
| Java | [wechatpay-java](https://github.com/wechatpay-apiv3/wechatpay-java) | [Maven Central](https://central.sonatype.com/artifact/com.github.wechatpay-apiv3/wechatpay-java/) |
| PHP | [wechatpay-php](https://github.com/wechatpay-apiv3/wechatpay-php) | [Packagist](https://packagist.org/packages/wechatpay/wechatpay) |
| Go | [wechatpay-go](https://github.com/wechatpay-apiv3/wechatpay-go) | [pkg.go.dev](https://pkg.go.dev/github.com/wechatpay-apiv3/wechatpay-go) |

服务端 SDK 基于 API v3 规则构建，提供核心功能支持，包括自动签名验签、敏感信息加解密以及回调数据的自动验签和解密。在 Java 和 Go 语言版本中，SDK 还封装了部分业务接口（参考[wechatpay-java业务接口介绍](https://github.com/wechatpay-apiv3/wechatpay-java/tree/main/service)，[wechatpay-go业务接口介绍](https://github.com/wechatpay-apiv3/wechatpay-go/tree/main/services)），开发者可通过 SDK 提供的 Service 方法直接调用。对于未封装的接口，开发者可基于 SDK 的 Core 方法自行扩展实现（参考[wechatpay-java](https://github.com/wechatpay-apiv3/wechatpay-java)-发送 HTTP 请求，[wechatpay-go](https://github.com/wechatpay-apiv3/wechatpay-go)-发送 HTTP 请求）。目前该 SDK 仅支持境内商户接入，境外商户由于使用不同的服务域名，可能会存在延迟，所以不建议通过 SDK 接入。

使用微信支付 SDK，你将体验到以下优势：

- 快速接入：SDK 封装了接口请求、签名验证等逻辑，开发者只需简单调用 SDK 提供的类和方法即可完成接入，无需处理签名验签和网络请求等底层逻辑

- 提高代码质量：SDK 在设计之初就考虑到易用性、安全性和扩展性，并经过多次迭代优化和严格测试，可以帮助开发者避免一些常见的错误和安全漏洞，提高代码的质量

- 方便升级和维护：当微信支付接口升级时，开发者仅需更新 SDK 即可使用新接口，无需修改业务代码，轻松应对接口变更带来的影响


## 社区 SDK

社区 SDK 可前往[微信支付开发者社区](https://developers.weixin.qq.com/community/pay/doc/00022e47830e90adbd2c507c951801) 搜索查看。

注意

社区 SDK 由广大的微信支付开发者自发提供，我们仅提供展示的平台，不对资源的质量负责，建议大家以参考为主，不要直接拷贝使用。

## 接下来阅读

- 根据你使用的编程语言，选择相应的快速上手教程：[Java](https://pay.weixin.qq.com/doc/v3/merchant/4012076506.md) 或 [PHP](https://pay.weixin.qq.com/doc/v3/merchant/4012076511.md) 或 [Go](https://pay.weixin.qq.com/doc/v3/merchant/4012076515.md)。

- [Postman 调试工具](https://pay.weixin.qq.com/doc/v3/merchant/4012076519.md)。

