## 1. 接口描述

接口请求域名： sms.tencentcloudapi.com 。

本接口 (SendSms) 用于发送验证码、通知类短信和营销短信。支持国内短信与国际/港澳台短信。

默认接口请求频率限制：3000次/秒。

<div class="rno-api-explorer">
    <div class="rno-api-explorer-inner">
        <div class="rno-api-explorer-hd">
            <div class="rno-api-explorer-title">
                推荐使用 API Explorer
            </div>
            <a href="https://console.cloud.tencent.com/api/explorer?Product=sms&Version=2019-07-11&Action=SendSms" class="rno-api-explorer-btn" hotrep="doc.api.explorerbtn"><i class="rno-icon-explorer"></i>点击调试</a>
        </div>
        <div class="rno-api-explorer-body">
            <div class="rno-api-explorer-cont">
                API Explorer 提供了在线调用、签名验证、SDK 代码生成和快速检索接口等能力。您可查看每次调用的请求内容和返回结果以及自动生成 SDK 调用示例。
            </div>
        </div>
    </div>
</div>

## 2. 输入参数

以下请求参数列表仅列出了接口请求参数和部分公共参数，完整公共参数列表见 [公共请求参数](/document/api/382/38767)。

| 参数名称 | 必选 | 类型 | 描述 |
|---------|---------|---------|---------|
| Action | 是 | String | [公共参数](/document/api/382/38767)，本接口取值：SendSms。 |
| Version | 是 | String | [公共参数](/document/api/382/38767)，本接口取值：2019-07-11。 |
| Region | 否 | String | [公共参数](/document/api/382/38767)，本接口不需要传递此参数。 |
| PhoneNumberSet.N | 是 | Array of String | 下发手机号码，采用 E.164 标准，格式为+[国家或地区码][手机号]，单次请求最多支持200个手机号且要求全为境内手机号或全为境外手机号。<br/>例如：+8618501234444， 其中前面有一个+号 ，86为国家码，18501234444为手机号。<br/>示例值：["+8618501234444"] |
| TemplateID | 是 | String | 模板 ID，必须填写已审核通过的模板 ID。模板ID可登录 [短信控制台](https://console.cloud.tencent.com/smsv2) 查看，若向境外手机号发送短信，仅支持使用国际/港澳台短信模板。<br/>示例值：1110 |
| SmsSdkAppid | 是 | String | 短信SdkAppid在 [短信控制台](https://console.cloud.tencent.com/smsv2)  添加应用后生成的实际SdkAppid，示例如1400006666。<br/>示例值：1400006666 |
| Sign | 否 | String | 短信签名内容，使用 UTF-8 编码，必须填写已审核通过的签名，签名信息可登录 [短信控制台](https://console.cloud.tencent.com/smsv2)  查看。注：国内短信为必填参数。<br/>示例值：腾讯云 |
| TemplateParamSet.N | 否 | Array of String | 模板参数，若无模板参数，则设置为空。<br/>示例值：["4370"] |
| ExtendCode | 否 | String | 短信码号扩展号，默认未开通，如需开通请联系 [sms helper](https://cloud.tencent.com/document/product/382/3773)。<br/>示例值：10 |
| SessionContext | 否 | String | 用户的 session 内容，可以携带用户侧 ID 等上下文信息，server 会原样返回。注意长度需小于512字节。<br/>示例值：outsid_1729495320_1011 |
| SenderId | 否 | String | 国际/港澳台短信 Sender ID。可参考 [Sender ID 说明](https://cloud.tencent.com/document/product/382/102831)。<br/>注：国内短信无需填写该项；国际/港澳台短信已申请独立 SenderId 需要填写该字段，默认使用公共 SenderId，无需填写该字段。<br/>示例值：Qsms |

## 3. 输出参数

| 参数名称 | 类型 | 描述 |
|---------|---------|---------|
| SendStatusSet | Array of [SendStatus](/document/api/382/38779#SendStatus) | 短信发送状态。<br/>注：可参考 <a href="#4.-.E7.A4.BA.E4.BE.8B">示例</a> ，包含短信发送成功和发送失败的输出示例。|
| RequestId | String | 唯一请求 ID，由服务端生成，每次请求都会返回（若请求因其他原因未能抵达服务端，则该次请求不会获得 RequestId）。定位问题时需要提供该次请求的 RequestId。|

## 4. 示例

### 示例1 发送短信成功示例

发送短信成功。

#### 输入示例

```
POST / HTTP/1.1
Host: sms.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SendSms
<公共请求参数>

{
    "PhoneNumberSet": [
        "+8618501234444",
        "+8618501234445"
    ],
    "SmsSdkAppid": "1400006666",
    "Sign": "腾讯云",
    "TemplateID": "1110",
    "TemplateParamSet": [
        "4370"
    ],
    "SessionContext": "outsid_1729495320_1011"
}
```

#### 输出示例

```json
{
    "Response": {
        "SendStatusSet": [
            {
                "SerialNo": "5000:1045710669157053657849499619",
                "PhoneNumber": "+8618501234444",
                "Fee": 1,
                "SessionContext": "outsid_1729495320_1011",
                "Code": "Ok",
                "Message": "send success",
                "IsoCode": "CN"
            },
            {
                "SerialNo": "5000:1045710669157053657849499718",
                "PhoneNumber": "+8618501234445",
                "Fee": 1,
                "SessionContext": "outsid_1729495320_1011",
                "Code": "Ok",
                "Message": "send success",
                "IsoCode": "CN"
            }
        ],
        "RequestId": "a0aabda6-cf91-4f3e-a81f-9198114a2279"
    }
}
```

### 示例2 发送短信失败示例

发送短信请求中模板参数的个数与申请的模板不一致，返回发送失败。

#### 输入示例

```
POST / HTTP/1.1
Host: sms.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SendSms
<公共请求参数>

{
    "PhoneNumberSet": [
        "+8618501234444",
        "+8618501234445"
    ],
    "SmsSdkAppid": "1400006666",
    "Sign": "腾讯云",
    "TemplateID": "1110",
    "TemplateParamSet": [
        "4370",
        "5"
    ],
    "SessionContext": ""
}
```

#### 输出示例

```json
{
    "Response": {
        "SendStatusSet": [
            {
                "SerialNo": "",
                "PhoneNumber": "+8618501234444",
                "Fee": 0,
                "SessionContext": "",
                "Code": "FailedOperation.TemplateParamSetNotMatchApprovedTemplate",
                "Message": "request content does not match the template content",
                "IsoCode": ""
            },
            {
                "SerialNo": "",
                "PhoneNumber": "+8618501234445",
                "Fee": 0,
                "SessionContext": "",
                "Code": "FailedOperation.TemplateParamSetNotMatchApprovedTemplat",
                "Message": "request content does not match the template content",
                "IsoCode": ""
            }
        ],
        "RequestId": "4e394811-9ebd-4d66-98ee-730b21c4a681"
    }
}
```


## 5. 开发者资源

### 腾讯云 API 平台

[腾讯云 API 平台](https://cloud.tencent.com/api) 是综合 API 文档、错误码、API Explorer 及 SDK 等资源的统一查询平台，方便您从同一入口查询及使用腾讯云提供的所有 API 服务。

### API Inspector

用户可通过 [API Inspector](https://cloud.tencent.com/document/product/1278/49361) 查看控制台每一步操作关联的 API 调用情况，并自动生成各语言版本的 API 代码，也可前往 [API Explorer](https://cloud.tencent.com/document/product/1278/46697) 进行在线调试。

### SDK

云 API 3.0 提供了配套的开发工具集（SDK），支持多种编程语言，能更方便的调用 API。
* Tencent Cloud SDK 3.0 for Python: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-python/-/blob/master/tencentcloud/sms/v20190711/sms_client.py), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-python/blob/master/tencentcloud/sms/v20190711/sms_client.py), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-python/blob/master/tencentcloud/sms/v20190711/sms_client.py)
* Tencent Cloud SDK 3.0 for Java: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-java/-/blob/master/src/main/java/com/tencentcloudapi/sms/v20190711/SmsClient.java), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-java/blob/master/src/main/java/com/tencentcloudapi/sms/v20190711/SmsClient.java), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-java/blob/master/src/main/java/com/tencentcloudapi/sms/v20190711/SmsClient.java)
* Tencent Cloud SDK 3.0 for PHP: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-php/-/blob/master/src/TencentCloud/Sms/V20190711/SmsClient.php), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-php/blob/master/src/TencentCloud/Sms/V20190711/SmsClient.php), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-php/blob/master/src/TencentCloud/Sms/V20190711/SmsClient.php)
* Tencent Cloud SDK 3.0 for Go: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-go/-/blob/master/tencentcloud/sms/v20190711/client.go), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-go/blob/master/tencentcloud/sms/v20190711/client.go), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-go/blob/master/tencentcloud/sms/v20190711/client.go)
* Tencent Cloud SDK 3.0 for Node.js: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-nodejs/-/blob/master/src/services/sms/v20190711/sms_client.ts), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/blob/master/src/services/sms/v20190711/sms_client.ts), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-nodejs/blob/master/src/services/sms/v20190711/sms_client.ts)
* Tencent Cloud SDK 3.0 for .NET: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-dotnet/-/blob/master/TencentCloud/Sms/V20190711/SmsClient.cs), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-dotnet/blob/master/TencentCloud/Sms/V20190711/SmsClient.cs), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-dotnet/blob/master/TencentCloud/Sms/V20190711/SmsClient.cs)
* Tencent Cloud SDK 3.0 for C++: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-cpp/-/blob/master/sms/src/v20190711/SmsClient.cpp), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-cpp/blob/master/sms/src/v20190711/SmsClient.cpp), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-cpp/blob/master/sms/src/v20190711/SmsClient.cpp)
* Tencent Cloud SDK 3.0 for Ruby: [CNB](https://cnb.cool/tencent/cloud/api/sdk/tencentcloud-sdk-ruby/-/blob/master/tencentcloud-sdk-sms/lib/v20190711/client.rb), [GitHub](https://github.com/TencentCloud/tencentcloud-sdk-ruby/blob/master/tencentcloud-sdk-sms/lib/v20190711/client.rb), [Gitee](https://gitee.com/TencentCloud/tencentcloud-sdk-ruby/blob/master/tencentcloud-sdk-sms/lib/v20190711/client.rb)

### 命令行工具

* [Tencent Cloud CLI 3.0](https://cloud.tencent.com/document/product/440/6176)

### 签名demo

下面提供了各个语言生成签名的过程，demo 只是起到演示的作用，不具备通用性，在实际的开发中还是推荐使用 SDK。

#### Signature V1:

* [Signature V1 demo for Python](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/python)
* [Signature V1 demo for Java](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/java)
* [Signature V1 demo for PHP](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/php)
* [Signature V1 demo for Go](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/golang)
* [Signature V1 demo for NodeJS](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/nodejs)
* [Signature V1 demo for .NET](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v1/dotnet)

#### Signature V3

* [Signature V3 demo for Python](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/python)
* [Signature V3 demo for Java](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/java)
* [Signature V3 demo for PHP](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/php)
* [Signature V3 demo for Go](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/golang)
* [Signature V3 demo for NodeJS](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/nodejs)
* [Signature V3 demo for .NET](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/dotnet)
* [Signature V3 demo for C++](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/cpp)
* [Signature V3 demo for Ruby](https://github.com/TencentCloud/signature-process-demo/tree/main/services/sms/signature-v3/ruby)

## 6. 错误码

以下仅列出了接口业务逻辑相关的错误码，其他错误码详见 [公共错误码](/document/api/382/38780#.E5.85.AC.E5.85.B1.E9.94.99.E8.AF.AF.E7.A0.81)。

| 错误码 | 描述 |
|---------|---------|
| FailedOperation.ContainSensitiveWord | 短信内容中含有敏感词，请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| FailedOperation.FailResolvePacket | 请求包解析失败，通常情况下是由于没有遵守 API 接口说明规范导致的，请参考 [请求包体解析1004错误详解](https://cloud.tencent.com/document/product/382/9558#.E8.BF.94.E5.9B.9E1004.E9.94.99.E8.AF.AF.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)。 |
| FailedOperation.InsufficientBalanceInSmsPackage | 套餐包余量不足，请 [购买套餐包](https://buy.cloud.tencent.com/sms)。 |
| FailedOperation.JsonParseFail | 解析请求包体时候失败。 |
| FailedOperation.MarketingSendTimeConstraint | 营销短信发送时间限制，为避免骚扰用户，营销短信只允许在8点到22点发送。 |
| FailedOperation.PhoneNumberInBlacklist | 手机号在免打扰名单库中，通常是用户退订或者命中运营商免打扰名单导致的，可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81) 解决。 |
| FailedOperation.SignatureIncorrectOrUnapproved | 签名未审批或格式错误。（1）可登录 [短信控制台](https://console.cloud.tencent.com/smsv2)，核查签名是否已审批并且审批通过；（2）核查是否符合格式规范，签名只能由中英文、数字组成，要求2 - 12个字，若存在疑问可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| FailedOperation.TemplateIncorrectOrUnapproved | 模板未审批或内容不匹配。（1）可登录 [短信控制台](https://console.cloud.tencent.com/smsv2)，核查模板是否已审批并审批通过；（2）核查是否符合 [格式规范](https://cloud.tencent.com/document/product/382/9558#.E8.BF.94.E5.9B.9E1014.E9.94.99.E8.AF.AF.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)，若存在疑问可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| FailedOperation.TemplateParamSetNotMatchApprovedTemplate | 请求内容与审核通过的模板内容不匹配。请检查请求中模板参数的个数是否与申请的模板一致。若存在疑问可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| FailedOperation.TemplateUnapprovedOrNotExist | 模板未审批或不存在。可登录 [短信控制台](https://console.cloud.tencent.com/smsv2)，核查模板是否已审批并审批通过。若存在疑问可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| InternalError.OtherError | 其他错误，请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81) 并提供失败手机号。 |
| InternalError.RequestTimeException | 请求发起时间不正常，通常是由于您的服务器时间与腾讯云服务器时间差异超过10分钟导致的，请核对服务器时间及 API 接口中的时间字段是否正常。 |
| InternalError.RestApiInterfaceNotExist | 不存在该 RESTAPI 接口，请核查 REST API 接口说明。 |
| InternalError.SendAndRecvFail | 接口超时或短信收发包超时，请检查您的网络是否有波动，或联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81) 解决。 |
| InternalError.SigFieldMissing | 后端包体中请求包体没有 Sig 字段或 Sig 为空。 |
| InternalError.SigVerificationFail | 后端校验 Sig 失败。 |
| InternalError.Timeout | 请求下发短信超时，请参考 [60008错误详解](https://cloud.tencent.com/document/product/382/9558#.E8.BF.94.E5.9B.9E60008.E9.94.99.E8.AF.AF.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)。 |
| InternalError.UnknownError | 未知错误类型。 |
| InvalidParameterValue.ContentLengthLimit | 请求的短信内容太长，短信长度规则请参考 [国内短信内容长度计算规则](https://cloud.tencent.com/document/product/382/18058) 或 [国际/港澳台短信内容长度计算规则](https://cloud.tencent.com/document/product/382/18052#size)。 |
| InvalidParameterValue.IncorrectPhoneNumber | 手机号格式错误。 |
| InvalidParameterValue.ProhibitedUseUrlInTemplateParameter | 禁止在模板变量中使用 URL。您可以参考正文模板审核标准下关于 [变量规范](https://cloud.tencent.com/document/product/382/39023#variable) 的描述 |
| InvalidParameterValue.SdkAppIdNotExist | SdkAppId 不存在。 |
| InvalidParameterValue.TemplateParameterFormatError | 验证码模板参数格式错误，验证码类模板，模板变量只能传入0 - 6位（包括6位）纯数字。 |
| InvalidParameterValue.TemplateParameterLengthLimit | 单个模板变量字符数超过规定的限制数。您可以参考 <a href="https://cloud.tencent.com/document/product/382/39023#variable">正文模板审核标准</a>下变量规范中关于长度的描述，对于长期未使用的账号及2024年1月25日后开通新账号默认最长支持6个字符，您的账号具体可支持字符长度以<a href="https://console.cloud.tencent.com/smsv2/csms-template/create">控制台显示为准</a>。更多疑问可联系 <a href="https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81">腾讯云短信小助手</a> 。 |
| LimitExceeded.AppCountryOrRegionDailyLimit | 业务短信国家/地区日下发条数超过设定的上限，可自行到控制台应用管理>基础配置下调整国际港澳台短信发送限制。 |
| LimitExceeded.AppCountryOrRegionInBlacklist | 业务短信国家/地区不在国际港澳台短信发送限制设置的列表中而禁发，可自行到控制台应用管理>基础配置下调整国际港澳台短信发送限制。 |
| LimitExceeded.AppDailyLimit | 业务短信日下发条数超过设定的上限 ，可自行到控制台调整短信频率限制策略。 |
| LimitExceeded.AppGlobalDailyLimit | 业务短信国际/港澳台日下发条数超过设定的上限，可自行到控制台应用管理>基础配置下调整发送总量阈值。 |
| LimitExceeded.AppMainlandChinaDailyLimit | 业务短信中国大陆日下发条数超过设定的上限，可自行到控制台应用管理>基础配置下调整发送总量阈值。 |
| LimitExceeded.DailyLimit | 短信日下发条数超过设定的上限 (国际/港澳台)，如需调整限制，可联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773)。 |
| LimitExceeded.DeliveryFrequencyLimit | 下发短信命中了频率限制策略，可自行到控制台调整短信频率限制策略，如有其他需求请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| LimitExceeded.PhoneNumberCountLimit | 调用接口单次提交的手机号个数超过200个，请遵守 API 接口输入参数描述。 |
| LimitExceeded.PhoneNumberDailyLimit | 单个手机号日下发短信条数超过设定的上限，可自行到控制台调整短信频率限制策略。 |
| LimitExceeded.PhoneNumberOneHourLimit | 单个手机号1小时内下发短信条数超过设定的上限，可自行到控制台调整短信频率限制策略。 |
| LimitExceeded.PhoneNumberSameContentDailyLimit | 单个手机号下发相同内容超过设定的上限，可自行到控制台调整短信频率限制策略。 |
| LimitExceeded.PhoneNumberThirtySecondLimit | 单个手机号30秒内下发短信条数超过设定的上限，可自行到控制台调整短信频率限制策略。 |
| MissingParameter.EmptyPhoneNumberSet | 传入的号码列表为空，请确认您的参数中是否传入号码。 |
| UnauthorizedOperation.IndividualUserMarketingSmsPermissionDeny | 个人用户没有发营销短信的权限，请参考 [权益区别](https://cloud.tencent.com/document/product/382/13444)。 |
| UnauthorizedOperation.RequestIpNotInWhitelist | 请求 IP 不在白名单中，您配置了校验请求来源 IP，但是检测到当前请求 IP 不在配置列表中，如有需要请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| UnauthorizedOperation.RequestPermissionDeny | 请求没有权限，请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| UnauthorizedOperation.SdkAppIdIsDisabled | 此 SdkAppId 禁止提供服务，如有需要请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 |
| UnauthorizedOperation.ServiceSuspendDueToArrears | 欠费被停止服务，可自行登录腾讯云充值来缴清欠款。 |
| UnauthorizedOperation.SmsSdkAppIdVerifyFail | SmsSdkAppId 校验失败，请检查 [SmsSdkAppId](https://console.cloud.tencent.com/smsv2/app-manage) 是否属于 [云API密钥](https://console.cloud.tencent.com/cam/capi) 的关联账户。 |
| UnsupportedOperation | 操作不支持。 |
| UnsupportedOperation.ChineseMainlandTemplateToGlobalPhone | 国内短信模板不支持发送国际/港澳台手机号。发送国际/港澳台手机号请使用国际/港澳台短信正文模板。 |
| UnsupportedOperation.ContainDomesticAndInternationalPhoneNumber | 群发请求里既有国内手机号也有国际手机号。请排查是否存在（1）使用国内签名或模板却发送短信到国际手机号；（2）使用国际签名或模板却发送短信到国内手机号。 |
| UnsupportedOperation.GlobalTemplateToChineseMainlandPhone | 国际/港澳台短信模板不支持发送国内手机号。发送国内手机号请使用国内短信正文模板。 |
| UnsupportedOperation.UnsupportedRegion | 不支持该地区短信下发。 |