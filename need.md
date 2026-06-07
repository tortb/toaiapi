从目前看来toaiapi的开发还有很多地方需要增加功能和优化前端
1.主要是http://localhost:3000/dashboard/overview 的用量概览
主要页面与两边的间距太宽了
需要有下面的内容，数据要使用实际数据才可以，需要合理安排组件排版
用量概览
监控余额、用量和请求量

近 24 小时消耗
$0
近 24 小时消耗量 (USD)

历史使用情况
$0
总消耗 (USD)

请求计数
0
总请求数

剩余额度
正常
$201
近 24 小时消耗
$0
可用时长
暂无使用记录
性能健康
最近 24 小时的性能指标
成功率
—
平均延迟
—
吞吐量
—
API 信息
已配置路由和延迟检测
未配置 API 路由
公告
最新平台更新和通知
目前暂无公告
常见问答
访问与计费常见问题解答
暂无 FAQ 条目
运行时间
来自 Uptime Kuma 的分组监控状态
未配置正常运行时间监控

余额

$29.35

可用

API 密钥

1

1 启用

今日请求

212

总计: 212

今日消费

$4.7516 / $9.5031

总计: $4.7516 / $9.5031

今日 Token

23.3M

输入: 1.1M / 输出: 198.2K

累计 Token

23.3M

输入: 1.1M / 输出: 198.2K

性能指标

1

RPM
4.7K

TPM
平均响应

21.05s

平均时间

按平台拆分
1 个平台
OpenAI
$4.7516
今日消费
$4.7516
请求
212
Token
23.3M
时间范围:

近 7 天
刷新
粒度:

按天
模型分布
模型	请求	Token	实际	标准
gpt-5.5	212	23.3M	$4.7516	$9.5031
Token 使用趋势
最近使用
近 7 天
gpt-5.5

2026/06/07 18:41:57

$0.0363 / $0.0726

5,570 tokens

gpt-5.5

2026/06/07 18:41:19

$0.0514 / $0.1029

7,472 tokens

gpt-5.5

2026/06/07 18:39:51

$0.0451 / $0.0902

4,214 tokens

gpt-5.5

2026/06/07 18:38:26

$0.0262 / $0.0524

5,165 tokens

gpt-5.5

2026/06/07 18:38:16

$0.0262 / $0.0525

1,218 tokens

查看全部
快捷操作

创建 API 密钥

生成新的 API 密钥


查看使用记录

查看详细的使用日志


兑换码

使用兑换码充值


2. http://localhost:3000/dashboard/usage 还有这个页面的数据还是eg，不是真实数据，需要更改为真实数据。

而api密钥页面以及后端还需要有下面的内容

名称
API 密钥
分组
用量
速率限制
过期时间
状态
上次使用时间
创建时间
操作
1
sk-b56...c3a1


ChatGPT按量计费
0.5x
选择分组
今日:
$5.7312
近30天:
$5.7312
-	永久有效	活跃	2026/06/07 19:41:39	2026/06/07 14:13:22	

使用密钥

导入到 CCS

禁用

编辑

删除
使用api密钥要有下面的内容
使用 API 密钥

将以下配置文件添加到 Codex CLI 配置目录中。


Codex CLI

Codex CLI (WebSocket)

OpenCode

macOS / Linux

Windows
请确保以下内容位于 config.toml 文件的开头部分

~/.codex/config.toml
复制
model_provider = "OpenAI"
model = "gpt-5.4"
review_model = "gpt-5.4"
model_reasoning_effort = "xhigh"
disable_response_storage = true
network_access = "enabled"
windows_wsl_setup_acknowledged = true
model_context_window = 1000000
model_auto_compact_token_limit = 900000

[model_providers.OpenAI]
name = "OpenAI"
base_url = "https://api.lsky.xyz"
wire_api = "responses"
requires_openai_auth = true
~/.codex/auth.json
复制
{
  "OPENAI_API_KEY": "sk-b560671cb60f222ab421a1e1372ce4c093226737fdbd25484d638ca3ac12c3a1"
}


可以配置所支持claude code和codex等cli工具，包括linux，mac，windows系统。



3.还要有数据看板帮助用户查看调用分析，这里需要适当使用统计图
模型调用分析
模型调用分析
用户统计
总数
0
统计计数
总额度
$0
统计配额
总 Token 数
0
统计 Token 数
平均 RPM
0
每分钟请求数
平均 TPM
0
每分钟 Token 数
暂无性能数据
消耗分布
总计： $0.00
柱状图
面积图
模型调用分析
总计： 0
调用趋势
调用次数分布
调用次数排行

4.下面就是api密钥界面，除了上面api的内容，点击创建api密钥后还需要有下面的，另外这个部分不管是admin还是其他用户都需要支持。
创建 API 密钥
通过提供必要信息添加新的 API 密钥。 完成後點擊保存。

基本信息
设置令牌的基本信息

输入名称

00:00
1
一次性创建多个 API 密钥（名称将添加随机后缀）

额度设置
设置令牌可用额度和数量

为此 API 密钥启用无限配额



高级设置
设置令牌的访问限制

下面就是模型界面，可以参考两个例子，使用真实数据，点击模型后可以看到不同分组的价格基础信息，api链接等内容
第一个参考，logo
云雾 API
首页
控制台
模型广场
代理加盟
联系我们
OpenClaw 一键部署
API 文档
供应商

展开更多
模型类型
标签

展开更多
可用令牌分组

展开更多
计费类型
模糊搜索模型名称
倍率

文本
claude-opus-4-8
Anthropic
claude-opus-4-8 是目前 Anthropic 最强的“能一个人扛住长时间复杂工作的工具”，特别适合开发者做大项目、建 Agent，或者对质量和自主性要求极高的场景。

输入价格 ⚡5.0000/M
补全价格 ⚡25.0000/M
缓存命中价格 ⚡0.5000/M
对话
识图
工具
按量计费

立即体验
文本
gemini-3.5-flash
Google
Gemini 3.5 Flash 已正式发布 (GA)，性能稳定，可大规模用于生产环境。作为我们最智能的 Flash 模型，它在智能体执行、编码和长期任务方面可大规模提供持续的领先性能。

输入价格 ⚡2.2500/M
补全价格 ⚡13.5000/M
缓存命中价格 ⚡0.2250/M
对话
工具
识图
按量计费

立即体验
图像
gpt-image-2
OpenAI
GPT Image 2 是我们最先进的图像生成模型，支持快速、高质量的图像生成和编辑。它支持灵活的图像尺寸和高保真图像输入。

输入价格 ⚡3.0000/M
补全价格 ⚡18.0000/M
绘画
dall-e-3格式
按量计费

立即体验
图像
qwen-image-2.0-2026-03-03
Bailian (阿里云百炼)
Qwen-Image-2.0系列加速版模型，实现了图片生成和图片编辑的融合；具备更专业的文字渲染1k token指令支持能力、更细腻的真实质感，细腻刻画写实场景、更强的语义遵循能力。加速版有效实现了模型效果和性能的最佳平衡

模型价格 ⚡0.2600
绘画
按次计费

立即体验
文本
qwen3.7-max
Bailian (阿里云百炼)
Qwen3.7系列中规模最大、综合能力最强的Max模型，当前开放纯文本模型能力供体验。Qwen3.7是面向智能体时代的新一代旗舰模型，核心优势在于智能体能力的广度与深度：在编程、办公与生产力、长周期自主执行方面均能出色胜任各项任务。

输入价格 ⚡12.0000/M
补全价格 ⚡36.0000/M
对话
工具
按量计费

立即体验
图像
wan2.7-image-pro
Bailian (阿里云百炼)
万相2.7-图像生成与编辑旗舰版模型，支持文生图、文生组图、图生组图、图像编辑、多图参考生成、交互式编辑，在文字渲染、主体一致性、复杂指令遵循上都有更强表现。

模型价格 ⚡0.6500
绘画
按次计费

立即体验
文本
gemini-3.1-flash-lite
Google
Google 旗下最具成本效益的模型，针对高容量智能体任务、翻译和简单的数据处理进行了优化。

输入价格 ⚡0.3750/M
补全价格 ⚡2.2500/M
缓存命中价格 ⚡0.0375/M
对话
工具
识图
按量计费

立即体验
文本
gpt-chat-latest
OpenAI
gpt-chat-latest指向当前在ChatGPT中使用的最新即时模型。

输入价格 ⚡7.5000/M
补全价格 ⚡45.0000/M
对话
工具
按量计费

立即体验
对话
grok-4.2-fast
Grok (xAI)
Grok-4.2-Fast 是 xAI 推出的 Grok 4 系列 中的一个快速、经济版模型

输入价格 ⚡0.4000/M
补全价格 ⚡3.0000/M
文本
按量计费

立即体验
音视频
pixverse-image-template
PixVerse
不同于基于视频的模版，这是一套以图片为核心的 AI 模版玩法——只需上传您的照片，即可快速生成沉浸式的 AI 内容体验。

模型价格 ⚡0.0410
图片模板
按次计费

立即体验
音视频
pixverse-lipsync
PixVerse
对口型（Lipsync）接口专为解决视频中的对口型问题而设计。它分析视频中说话者的嘴部动作和提供的音频、TTS，使其精确匹配。这使您的视频更具表现力和吸引力，增加了故事叙述的深度。

模型价格 ⚡0.0410
视频
对口型
按次计费

立即体验
音视频
pixverse-mask-selection
PixVerse
Pixverse Mask Selection（或称 Swap Mask Generation）是 PixVerse 平台在 Modify 功能中使用的AI 智能蒙版生成工具，专门用于精确选择视频中需要编辑的区域（主体、物体、背景等），再配合提示词、参考图或替换模式进行针对性修改

模型价格 ⚡0.0410
Mask
按次计费

立即体验
音视频
pixverse-mimic
PixVerse
Mimic 功能支持将参考视频中的动作迁移到目标人物图片上，实现动作模仿与重建。 通过提供： • 一段跳舞（或动作）参考视频 • 一张人物图片 Mimic 功能会分析视频中的动作序列，并将其重建到提供的角色上，生成一段全新的视频，使角色复现原始动作。

模型价格 ⚡0.0410
动作模仿
按次计费

立即体验
音视频
pixverse-modify
PixVerse
视频编辑(Modify) 功能支持对已有视频的任意部分进行编辑，包括添加、替换、删除、修改元素，或改变整体风格。 它能够帮助你快速完成视频二创，让一个视频衍生出更多全新的创意可能。

模型价格 ⚡0.0410
视频编辑
按次计费

立即体验
音视频
pixverse-multi-transition
PixVerse
多帧（Multi-transition）功能允许你通过提供 2–7 张关键帧，生成一段 1–30 秒 的视频，保证风格一致、镜头衔接流畅。该功能专为专业创作者设计，能够对视频进行更精细的控制，确保画面中的人物与动作在整个序列中保持连贯和可控。

模型价格 ⚡0.0410
多帧
按次计费

立即体验
音视频
pixverse-restyle
PixVerse
Restyle 功能可将你的视频片段即时转换为全新的视觉风格 —— 例如 3D、动漫、电影感或增强写实风格。无论你想打造艺术风格还是品牌视觉，Restyle 都能赋予你创造专属世界的强大能力。

模型价格 ⚡0.0410
重绘
按次计费

立即体验
音视频
pixverse-sound-effect
PixVerse
音效生成（背景音乐)接口可智能生成适配视频画面的音效、环境音，也可通过文字指令输入。支持多场景，能准确匹配视频节奏和内容逻辑。

模型价格 ⚡0.0410
音效
按次计费

立即体验
音视频
pixverse-swap
PixVerse
SWAP 是一项强大的视频编辑能力。你可以上传或生成一段视频，然后选择其中的一帧，并选中想要编辑的对象。接着，上传一张 目标图片，系统将为你生成一个全新的视频。 在使用该功能时，请配合 mask/selection API 一起使用，以指定需要替换的目标区域。目前暂不支持外部 mask_url 输入。

模型价格 ⚡0.0410
主体替换
按次计费

立即体验
音视频
pixverse-video
PixVerse
它属于前沿 AI 视频基础模型（video foundation model），核心能力包括 Text-to-Video（文字生成视频）和 Image-to-Video（图片生成视频），支持上传图片或输入提示词，瞬间生成高清动态视频，常用于短视频、广告、内容创作等。

模型价格 ⚡0.0410
视频
首尾帧
参考生视频
按次计费

立即体验
文本
qwen3.7-plus
Bailian (阿里云百炼)
Qwen3.7系列中高性价比Plus模型，在强大文本能力的基础上全面升级了视觉-语言能力，同时保持了在编码、工具使用和生产力工作流方面的完整智能体能力。其核心特色为多模态交互混合智能体能力，能够感知真实世界场景、读取屏幕并操作 GUI、基于视觉参考生成代码、端到端导航移动应用。

输入价格 ⚡3.0000/M
补全价格 ⚡12.0000/M
阶梯
对话
工具
按量计费

立即体验
音视频
suno_music_open
Suno
Suno API，可以打造出 Suno 官网同款平台，支持官网所有操作。此模型为生成歌曲用，支持自定义模式、灵感模式、续写

模型价格 ⚡0.2400
音乐
异步
按次计费

立即体验
文本
claude-opus-4-7
Anthropic
Claude Opus 4.7 支持 100 万令牌上下文窗口 、128k 最大输出令牌、 自适应思维 ，以及与 Claude Opus 4.6 相同的工具和平台功能。

输入价格 ⚡5.0000/M
补全价格 ⚡25.0000/M
缓存创建价格 ⚡6.2500/M
缓存命中价格 ⚡0.5000/M
对话
识图
工具
按量计费

立即体验
文本
doubao-seed-2-0-lite-260428
Doubao (豆包)
豆包大模型家族首款全模态理解模型，支持视频、图像、音频、文本原生统一理解，同时升级Agent、Coding与GUI能力

输入价格 ⚡0.9000/M
补全价格 ⚡5.4000/M
音频输入价格 ⚡13.5000/M
对话
工具
按量计费

立即体验
文本
doubao-seed-2-0-mini-260428
Doubao (豆包)
豆包大模型家族全模态理解模型，更短的思考长度，更高的tokens效率

输入价格 ⚡0.3000/M
补全价格 ⚡3.0000/M
音频输入价格 ⚡4.5000/M
对话
工具
按量计费

立即体验
文本
gpt-5.5-pro
OpenAI
GPT-5.5pro现可用于ResponsesAPI请求的处理，包括通过BBatch API进行操作，以在响应API请求之前支持多轮模型交互功能，并将在未来实现其他高级API特性。由于GPT-5.5pro旨在应对复杂问题，某些请求的处理过程可能需要数分钟才能完成。为避免超时情况发生，请尝试使用后台模式。

输入价格 ⚡180.0000/M
补全价格 ⚡1080.0000/M
对话
工具
按量计费

立即体验
文本
MiniMax-M3
Minimax
最新 M 系列语言模型，适用于 Agent 推理、工具调用、代码和长上下文任务

输入价格 ⚡0.8400/M
补全价格 ⚡3.3600/M
缓存命中价格 ⚡0.1680/M
阶梯
对话
工具
按量计费

立即体验
文本
qwen3.6-max-preview
Bailian (阿里云百炼)
Qwen3.6系列中规模最大、综合能力最强的Max模型Preview版本，当前开放纯文本模型能力供体验。相较于此前发布的Qwen3-Max和Qwen3.6-Plus，本模型在vibe coding能力上进一步提升、coding agent执行更加高效、前端编程开发能力显著提升；长尾知识能力进一步升级。

输入价格 ⚡13.5000/M
补全价格 ⚡81.0000/M
阶梯
对话
工具
按量计费

立即体验
文本
deepseek-v4-flash
DeepSeek
DeepSeek-V4-Flash 是DeepSeek V4系列的轻量化版本，主打高性价比与高吞吐效率，适合通用对话和基础文本任务，同时支持百万Token长上下文和高效推理

输入价格 ⚡1.0000/M
补全价格 ⚡2.0000/M
缓存命中价格 ⚡0.0200/M
对话
工具
按量计费

立即体验
文本
deepseek-v4-pro
DeepSeek
DeepSeek-V4-Pro 是DeepSeek推出的高性能开源大模型，具备顶尖推理与Agent能力，支持超长上下文，适配国产昇腾芯片，性价比极高

输入价格 ⚡3.0000/M
补全价格 ⚡6.0000/M
缓存命中价格 ⚡0.0252/M
对话
思考
工具
按量计费

立即体验
音视频
gemini-3.1-flash-tts-preview
Google
gemini-3.1-flash-tts-preview文字转语音音频模型经过优化，可实现高性价比、低延迟、可控的语音生成。

输入价格 ⚡2.4000/M
补全价格 ⚡48.0000/M
音频
按量计费

立即体验
©


6.gpt-chat-latest

文本
OpenAI
基本信息
模型的详细描述和基本特性
gpt-chat-latest指向当前在ChatGPT中使用的最新即时模型。

对话
工具
API端点
模型支持的接口端点信息
POST
openai-response
/v1/responses

POST
openai
/v1/chat/completions

分组价格
不同用户分组的价格信息
auto分组调用链路
→
→
→
分组	计费类型	价格摘要
输入价格 ⚡15.0000
/ 1M Tokens
补全价格 ⚡90.0000
/ 1M Tokens
输入价格 ⚡30.0000
/ 1M Tokens
补全价格 ⚡180.0000
/ 1M Tokens



7.我觉得header页面可以增加排行榜功能，参考i如下
排行榜

排行榜
探索平台上使用最多的模型和增长中的供应商，数据基于实时用量更新。

今天
本周
本月
今年
全部时间
热门模型
最近几周内各模型的每周 Token 用量

0
令牌
暂无历史数据
LLM 排行榜
对比平台上最受欢迎的模型

没有匹配筛选条件的模型
市场份额
最近几周内各厂商的 Token 占比

暂无历史数据
按模型厂商
厂商按聚合 Token 用量排序

暂无厂商数据
上升趋势
正在攀升的模型

当前没有显著上升的模型
下降趋势
排名下滑的模型

当前没有显著下降的模型


8.在支付页面http://localhost:3000/recharge 也可以优化更改，有两个参考
参考一：在线充值
快速方便的充值方式
tortb (普通用户)
当前余额
⚡0.20
历史消耗
⚡0.00
充值类型
选择充值金额（享受批量折扣）
⚡100.00
9.90折节省 1.0%
⚡500.00
9.85折节省 1.5%
⚡1000.00
9.80折节省 2.0%
⚡2000.00
9.75折节省 2.5%
⚡3000.00
9.70折节省 3.0%
⚡5000.00
9.65折节省 3.5%
⚡10000.00
9.60折节省 4.0%
⚡20000.00
9.55折节省 4.5%
⚡50000.00
9.50折节省 5.0%
⚡100000.00
9.45折节省 5.5%
⚡300000.00
9.40折节省 6.0%
⚡500000.00
9.35折节省 6.5%
⚡800000.00
9.30折节省 7.0%
⚡1000000.00
9.25折节省 7.5%
充值数量
⚡100.00
实付金额
49.5 元
折扣
9.90折
选择支付方式
兑换码充值
使用兑换码快速充值
请输入兑换码
邀请奖励
邀请好友获得额外奖励
待使用收益
¥0.00
总收益
¥0.00
邀请人数
0
奖励比例
10%
邀请好友注册，好友充值前3次，您可获得返现。
邀请链接
https://yunwu.ai/register?aff=Sg2G
邀请好友注册，好友充值后您可获得相应奖励
通过划转功能将奖励额度转入到您的账户余额中
邀请的好友越多，获得的奖励越多
ID	用户 ID	用户名	充值时间	充值额度	支付金额	支付方式	订单号	状态	开票
暂无数据

参考二：
当前余额
$201
剩余配额
总用量
$0
总消耗额度
API 请求
0
总请求数
添加资金
选择金额和支付方式
1
待支付金额：
0.55
输入您的兑换码
推荐计划
当您的推荐人充值时即可获得奖励。随时将累计奖励转移到您的余额。

待确认
$0
总收入
$0
邀请
0
这里微信支付宝可以使用ta们的logo，找不到我可以提供。

9.个人资料页面需要全部重写，参考如下
Root User
超级管理员
@tortb
•
default
当前余额
$201
剩余配额
总用量
$0
总消耗额度
API 请求
0
总请求数
设置
配置您的账户偏好和集成

账户绑定

设置与偏好
邮箱

未绑定

GitHub

未绑定

语言偏好
设置界面显示语言
界面语言
语言偏好会同步到您登录的所有设备，并影响 API 错误消息语言。

zh
安全
管理您的安全设置和账户访问

更改密码

更新您的密码以确保账户安全


访问令牌

生成和管理您的 API 访问令牌


删除账户

永久删除您的帐户和所有数据


1
累计签到
$0.0077
本月获得
$0.0077
累计获得
2026-06
Su
Mo
Tu
We
Th
Fr
Sa
每日仅可签到一次，请勿重复签到
每日签到可获得随机额度奖励
奖励将直接添加到您的余额
请勿重复签到；每天仅一次
Passkey 登录
使用通行密钥登录，无需输入密码。
通行密钥认证

已禁用
上次使用时间： 暂未使用

两步验证
为您的账户添加额外的安全层
两步验证

已禁用
为您的账户添加额外的安全层



10.通知配置
在dashboard的个人资料/设置页面，需要可以设置通知方式：邮箱，webhook通知，wxpusher通知，企业微信通知，钉钉通知，飞书通知，参考页面如下
通知方式
通知邮箱：设置用于接收额度预警的邮箱地址，不填则使用账号绑定的邮箱
留空则使用账号绑定的邮箱
设置用于接收额度预警的邮箱地址，不填则使用账号绑定的邮箱
订阅事件：余额不足预警
促销活动通知
防失联-定期通知
系统公告通知
模型调价通知
选择您希望接收的通知类型
预警额度
$
1.00
当余额低于 $1.00 时，将收到预警通知（30分钟最多1次）
发送测试通知 保存

11.实名认证
在个人资料/设置页面需要有实名认证，接入阿里云腾讯云，在docs下有相关文档

12.后台渠道设置：http://localhost:3000/admin/channels
参考页面创建渠道OpenAI
通过提供必要信息添加新的通道。

基本信息
例如，OpenAI GPT-4 生产环境
OpenAI
启用或禁用此渠道


org-...
OpenAI 组织 ID（可选）

API 访问
留空使用默认
自定义 API 基础 URL。对于官方渠道，New API 具有内置地址。仅针对第三方代理站点或特殊端点填写此项。请勿添加 /v1 或尾部斜杠。

身份验证
single
从多个密钥创建多个渠道

输入此渠道的 API 密钥
来自提供商的 API 密钥

模型与分组
选择模型或添加自定义模型
此渠道支持的模型列表。使用逗号分隔多个模型。

添加自定义模型（多个以逗号分隔）
未配置模型映射。点击“添加映射”即可开始使用。
将请求模型名称映射到实际提供商模型名称 (JSON 格式)

default
可以访问此渠道的用户组。


高级设置
请求覆盖、路由行为和上游模型自动化
路由与覆盖
路由策略
0
优先级更高的渠道优先被选中

0
用于负载均衡。权重越高 = 请求越多

用于测试的模型
测试通道连接时使用的模型

重复失败时自动禁用通道


内部备注
用于分组渠道的可选标签
按标签对渠道进行分组以进行批量操作

关于此渠道的可选备注
内部备注（不显示给用户）

覆盖规则
将上游状态码映射到不同的代码

未配置状态码映射。
覆盖请求参数。无法覆盖 stream 参数。

未配置参数覆盖。
覆盖请求标头

输入 JSON 以覆盖请求头
支持变量: {api_key} — 渠道密钥, {client_header:NAME} — 客户端请求头值

渠道额外设置
字段透传控制
将 service_tier 字段透传到上游


开启后将阻止 store 字段透传


将 safety_identifier 字段透传到上游


透传 include 字段以用于用量混淆


透传 inference_geo 字段以用于地理路由


强制将响应格式化为 OpenAI 标准（仅限 OpenAI 渠道）


将 reasoning_content 转换为 content 中的 <think> 标签


将请求体直接传递给上游


socks5://user:pass@host:port
此渠道的网络代理（支持 socks5 协议）

输入系统提示词（用户提示词优先）
此渠道的默认系统提示

将渠道系统提示与用户的提示连接起来


检测上游模型设置
定期检查上游模型是否有变更


检测到上游模型变更时自动同步模型列表


例如：gpt-4.1-nano,regex:^claude-.*$,regex:^sora-.*$
使用英文逗号分隔精确模型名。以 regex: 开头可使用正则表达式忽略。

上次检测时间: -
上次检测到可加入模型: 无

13.支付配置http://localhost:3000/admin/payment-configs
需要向其他美化
我觉得可以改成计费与支付，下面包含
额度设置，模型定价，分组定价，支付网关，签到奖励
额度设置：额度设置
配置用户额度分配和奖励

10
授予新用户的初始配额

500
向用户收费前消耗的配额

1000
授予邀请其他用户的配额

1000
授予被邀请用户的配额

启用后，零成本模型也会在最终结算前预先消耗配额。


https://example.com/topup
供用户购买配额的外部链接

https://docs.example.com
您的文档站点链接

模型定价：模型定价
配置模型定价倍率和工具价格

模型价格
工具价格
上游价格同步
搜索模型...
	
价格摘要
	
360GPT_S2_V9
按 Token
输入 $1.7144
仅基础输入价格
	
360gpt-pro
按 Token
输入 $1.7144
仅基础输入价格
	
360gpt-turbo
按 Token
输入 $0.1716
仅基础输入价格
	
360gpt-turbo-responsibility-8k
按 Token
输入 $1.7144
仅基础输入价格
	
360gpt2-pro
按 Token
输入 $1.7144
仅基础输入价格
	
ada
按 Token
输入 $20
仅基础输入价格
	
babbage
按 Token
输入 $20
仅基础输入价格
	
babbage-002
按 Token
输入 $0.4
仅基础输入价格
	
bge-large-en
按 Token
输入 $0.27397260274
仅基础输入价格
	
bge-large-zh
按 Token
输入 $0.27397260274
仅基础输入价格
	
black-forest-labs/flux-1.1-pro
按次
$0.04 / 请求
固定按次价格
	
BLOOMZ-7B
按 Token
输入 $0.547945205479
仅基础输入价格
	
chatglm_lite
按 Token
输入 $0.2858
仅基础输入价格
	
chatglm_pro
按 Token
输入 $1.4286
仅基础输入价格
	
chatglm_std
按 Token
输入 $0.7144
仅基础输入价格
	
chatglm_turbo
按 Token
输入 $0.7144
仅基础输入价格
	
chatgpt-4o-latest
按 Token
输入 $5
仅基础输入价格
	
claude-3-5-haiku-20241022
按 Token
输入 $1 · 2 额外项
缓存 $0.1 · 缓存写入 $1.25
	
claude-3-5-sonnet-20240620
按 Token
输入 $3 · 2 额外项
缓存 $0.3 · 缓存写入 $3.75
	
claude-3-5-sonnet-20241022
按 Token
输入 $3 · 2 额外项
缓存 $0.3 · 缓存写入 $3.75
20
每页行数

第 1 页，共 15 页
...
选择一个模型编辑定价
先在表格中快速浏览价格，然后选择一行在这里编辑。

允许客户端通过 `/api/ratio` 查询配置的比例。
支付网关：支付网关
配置充值定价和支付网关集成

合规声明已确认
确认时间：2026/5/24 13:31:35，确认用户：#1
通用设置
所有支付网关的共享配置

0.55
每美元余额（Epay）的收费金额

1
用户可以充值的最小美元金额 (Epay)

搜索付款方式...
名称	类型	颜色	最低充值	操作
支付宝	alipay	
rgba(var(--semi-blue-5), 1)
—	
微信	wxpay	
rgba(var(--semi-green-5), 1)
—	
自定义1	custom1	
black
50	
配置可用的支付方式。提供一个 JSON 数组。

向用户显示的预设充值金额

$10
$20
$50
$100
$200
$500
$1000
$2000
$5000
$10000
例如，100
预设充值金额（JSON 数组）

配置基于充值金额的折扣率

未配置折扣等级。点击“添加折扣等级”即可开始使用。
按充值金额的折扣映射 (JSON 对象)

Epay 网关
Epay 支付集成的配置

https://epay.fanstars.net
您的 Epay 服务提供的基础地址

https://epay.fanstars.net
可选的回调覆盖。留空以使用服务器地址

1008
输入新密钥以更新
除非正在轮换密钥，否则留空

Stripe 网关
Stripe 支付集成的配置

Webhook 配置：

Webhook URL: <ServerAddress>/api/stripe/webhook
必需事件： checkout.session.completed 和 checkout.session.expired
配置位置： Stripe 控制面板
sk_xxx 或 rk_xxx
Stripe API 密钥（除非更新，否则留空）

whsec_xxx
Webhook 签名密钥（除非更新，否则留空）

tortb
Stripe 产品价格 ID

8
例如，8 表示每美元兑换 8 单位本地货币

1
最低充值金额（美元）

允许用户输入促销代码


Creem 网关
Creem 支付集成的配置

Webhook 配置：

Webhook URL: <ServerAddress>/api/creem/webhook
在您的 Creem 仪表板中配置
输入 Creem API 密钥
Creem API 密钥（除非更新，否则留空）

输入 webhook 密钥
Webhook 签名密钥（除非更新，否则留空）

启用 Creem 支付测试模式


搜索产品...
未配置产品。点击 "添加产品" 开始。
配置 Creem 产品。提供 JSON 数组。

Waffo Pancake MoR
无需注册公司即可开始全球收款，适合个人 / OPC 一人公司 / Startup。Waffo Pancake 作为你的 Merchant of Record，替你承担全球收款的合规责任：消费税、开票（Invoice）、订阅管理、退款与拒付处理。独立开发者可以直接上线，专注产品而非合规。极速入驻，一个 Prompt 完成集成。

Webhook 配置：

Webhook URL（测试）： <ServerAddress>/api/waffo-pancake/webhook/test
Webhook URL（生产）： <ServerAddress>/api/waffo-pancake/webhook/prod
将上述 URL 分别注册到 Pancake 控制台的测试模式和生产模式 Webhook 槽位中。独立的端点可以防止测试流量误充值到生产账户。
配置位置： Waffo Pancake 控制台
MER_xxx
留空以保留现有密钥
测试 / 生产环境由你粘进来的 API 私钥本身决定——集成阶段用 Test Key，正式上线时再换成 Production Key。

绑定 Pancake 店铺 + 商品
请先填写上方凭证。

为什么只绑定一个店铺 + 商品？

绑定的店铺是 new-api 从此处创建的所有 Pancake 商品（钱包充值商品 + 各订阅套餐商品）的父容器。一个店铺足够使用；只有在确实需要使用独立的 Pancake 商品目录时，才需要绑定到不同的店铺。
绑定的商品用于钱包充值：用户输入任意金额时，new-api 用这一个 Pancake 商品发起结账并按用户输入动态设置价格 —— 不需要预先创建 $1 / $5 / $10 等一堆 SKU。
订阅套餐不使用这里绑定的商品 —— 每个套餐在「订阅」管理页有自己专属的 Pancake 商品，可以手动填写或点 "+ 新建" 一键创建。
https://example.com/console/topup
作为新商品的 SuccessURL。留空时会再次提示确认。

Waffo 支付聚合网关
支付聚合模式——使用你自己的注册公司（海外主体）来入驻，适合 Enterprise 企业

请在 Waffo 后台获取 API 密钥、商户 ID 以及 RSA 密钥对，并配置回调地址。


1
1
https://example.com/api/waffo/webhook
https://example.com/console/topup
支付方式
显示名称	图标	支付方式类型	支付方式名称	操作
Card	Card	CREDITCARD,DEBITCARD	-	
Apple Pay	Apple Pay	APPLEPAY	APPLEPAY	
Google Pay	Google Pay	GOOGLEPAY	GOOGLEPAY	



签到设置
配置用户每日签到奖励

允许用户每日签到获取随机额度奖励


1000
签到奖励的最小额度

5000
签到奖励的最大额度

14.在有就是
Gemini
配置 Gemini 安全行为、版本覆盖和思维适配器

{
  "default": "OFF"
}
以 JSON 格式提供按类别划分的安全覆盖。使用 `default` 作为回退值。

{
  "default": "v1beta",
  "gemini-1.0-pro": "v1"
}
将模型标识符映射到 Gemini API 版本。当未找到特定匹配项时，将应用 `default` 条目。

[
  "gemini-2.0-flash-exp-image-generation",
  "gemini-2.0-flash-exp",
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview"
]
接受支持 Imagine API 的模型标识符的 JSON 数组。

支持 `-thinking`、`-thinking-`{{budget}}`, 和 `-nothinking` 后缀，同时路由到正确的 Gemini 变体。


0.6
预算令牌 = 最大令牌数 × 比例。接受 0.002 到 1 之间的十进制数。建议与上游计费保持一致。

即使禁用适配器，Gemini 也会继续自动检测思维模式。仅当您需要对定价和预算进行更精细的控制时才启用此选项。

仅为使用 OpenAI 格式的 Gemini/Vertex 渠道填充 thoughtSignature


Vertex AI 不支持 functionResponse.id 字段，开启后将自动移除该字段




Claude
覆盖 Anthropic 标头、默认值和思维适配器行为

{}
以 JSON 格式提供按模型划分的标头覆盖。可用于启用测试功能，例如扩展上下文窗口。

{
  "default": 8192
}
示例 { "default": 8192, "claude-3-haiku-20240307": 4096, "claude-3-opus-20240229": 4096, "claude-3-7-sonnet-20250219-thinking": 8192 }

将 `-thinking` 后缀转换为 Anthropic 原生思维模型，同时保持价格可预测性。


0.8
预算令牌 = 最大令牌数 × 比例。接受 0.1 到 1 之间的十进制数。

Claude
覆盖 Anthropic 标头、默认值和思维适配器行为

{}
以 JSON 格式提供按模型划分的标头覆盖。可用于启用测试功能，例如扩展上下文窗口。

{
  "default": 8192
}
示例 { "default": 8192, "claude-3-haiku-20240307": 4096, "claude-3-opus-20240229": 4096, "claude-3-7-sonnet-20250219-thinking": 8192 }

将 `-thinking` 后缀转换为 Anthropic 原生思维模型，同时保持价格可预测性。


0.8
预算令牌 = 最大令牌数 × 比例。接受 0.1 到 1 之间的十进制数。


渠道亲和性
基于请求上下文提取的 Key，优先复用上一次成功的渠道（粘滞选路）

渠道亲和性会基于从请求上下文或 JSON Body 提取的 Key，优先复用上一次成功的渠道。

100000
3600

如果亲和到的渠道失败，重试到其他渠道成功后，将亲和更新到成功的渠道。
缓存条目: 0 / 0
名称	模型正则	Key 来源	TTL	重试	作用域	缓存	操作
codex cli trace	
^gpt-.*$
gjson:prompt_cache_key
-	
不重试
分组
·
规则
0	
claude cli trace	
^claude-.*$
gjson:metadata.user_id
-	
不重试
分组
·
规则
0	
codex cli trace-2	
^gpt-.*$
gjson:prompt_cache_key
-	
不重试
分组
·
规则
0	
claude cli trace-2	
^claude-.*$
gjson:metadata.user_id
-	
不重试
分组
·
规则
0	

15.api地址设置
添加 API 快捷方式
配置仪表板的 API 文档链接

https://api.example.com
例如，CN2 GIA
例如，推荐给中国大陆用户
blue
API 卡的可视指示器颜色
用来设置不同的api地址，以保证全球可用的服务器

16.监控Uptime Kuma
直接在仪表板上显示分组的 Uptime Kuma 状态页面

添加 Uptime Kuma 分组
配置用于仪表板的监控状态页面分组

例如，核心 API，OpenAI，Claude
此监控分组的显示名称（最多 50 个字符）

https://status.example.com
您的 Uptime Kuma 实例的基础 URL

我的状态
别名将附加到 URL: {url}/status/{slug}

