短信服务提供短信发送、发送状态查询等API接口，您可以通过调用API接口申请签名和模板，并给目标用户发送短信。

您可以根据业务需要和自身情况选择合适的方式调用短信服务API：

-   阿里云[OpenAPI 开发者门户](https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms?spm=a2c4g.11186623.0.0.2f2869bdzPSx3c&sdkStyle=dara)
    
    适用于习惯交互式操作界面的场景，或者初次使用阿里云产品的开发者用户。您可以通过OpenAPI开发者门户调试和获取SDK请求示例。
    
-   [短信服务SDK](https://help.aliyun.com/zh/sms/developer-reference/sdk-product-overview/#concept-2068981)
    
    支持多种编程语言，包括[Java](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=java-tea&tab=primer-doc)、[Go](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=go-tea&tab=primer-doc)、[C#](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=csharp-tea&tab=primer-doc)、[PHP](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=php-tea&tab=primer-doc)、[Node.js/TypeScript](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=typescript-tea&tab=primer-doc)、[Python](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=python-tea&tab=primer-doc)。使用SDK集成短信服务，可提升您使用短信服务的开发效率。
    
-   自定义封装API调用（不推荐）
    
    阿里云SDK已经封装了签名、超时、重试等机制，我们建议您使用SDK进行集成，降低开发成本。如果您需要自行封装请求来进行API调用，请参见[SendSms](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-sendsms#%E8%AF%B7%E6%B1%82%E7%A4%BA%E4%BE%8B)和[签名示例代码](https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature#title-h9n-xj6-ue8)。
    

本文将以SDK的方式引导您使用短信服务。您可以先通过[OpenAPI 开发者门户](https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms?spm=a2c4g.11186623.0.0.2f2869bdzPSx3c&sdkStyle=dara)，查看、体验短信服务API后，根据本文指引开始集成短信服务API。整体流程：

![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/1821260871/CAEQVRiBgMCC0.afshkiIGUxZDM5ZmUwNDQ2ZjQ3ZjBiZjQ3NGNmMzAxODEyYzMx4078186_20231121181302.359.svg)

## 准备工作

| **准备事项** | **说明** | **相关文档** |
| --- | --- | --- |
| [**账号注册**](https://account.aliyun.com/register/register.htm?spm=a2c45.11132027.495613.5.57577fec5LicwM) [**实名认证**](https://account.console.aliyun.com/#/auth/home) | 因短信签名实名制要求，使用短信服务必须提供企业资质信息。 - 个人认证：表示账号持有者是个人，短信服务不支持“个人资质”的签名实名制报备，推荐您使用免资质签名模板申请的[短信认证](https://dypns.console.aliyun.com/smsServiceOverview)产品。若您已有企业资质，可将阿里云账号升级为“[企业认证](https://myaccount.console.aliyun.com/overview)”或添加“他用”企业资质。 - 企业认证：表示账号持有者是企业或政府部门，需提供自用或他用企业资质使用短信服务。 **重要** 在当前的短信签名实名制要求下，个人账号的自用资质无法通过签名实名制报备，个人用户请使用[短信认证](https://dypns.console.aliyun.com/smsServiceOverview)产品或升级为企业认证账号。 | [使用须知](https://help.aliyun.com/zh/sms/user-guide/usage-notes#section-e0n-hlw-qjh) |
| **服务开通** | 登录[短信服务控制台](https://dysms.console.aliyun.com)，开通短信服务。 |     |
| **用户权限** | **说明** 阿里云主账号拥有较高权限，建议您通过RAM用户进行API调用和日常运维。 您可以通过[RAM控制台](https://ram.console.aliyun.com/users)，单击RAM用户名称查看用户权限。请确保您所调用API的RAM用户已有短信服务相关权限： - **AliyunDysmsFullAccess**：管理短信服务的权限。 | [创建RAM用户](https://help.aliyun.com/zh/ram/user-guide/create-a-ram-user) [管理RAM用户的权限](https://help.aliyun.com/zh/ram/user-guide/grant-permissions-to-the-ram-user) [自定义授权信息](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-ram) |
| **AccessKey ID** | 您可以登录[RAM控制台](https://ram.console.aliyun.com/users)，单击RAM用户名称查看**AccessKey ID**。 | [创建AccessKey](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair) |
| **AccessKey Secret** | **创建后不支持二次查看**。若本地无备份，建议重新创建一对AccessKey使用。 |
| **设置预警** | 为保障您的业务稳定和资金安全，建议您登录控制台[通用设置-国内消息设置](https://dysms.console.aliyun.com/msgsetting/safe)页面，设置联系人并开启和配置**验证码防盗刷监控**、**发送量预警**、**套餐包余量预警**和**发送频率预警**等。当触发预警时，平台会通知到联系人，联系人可第一时间收到预警通知后及时处理。 **说明** 建议您阅读[验证码防盗刷](https://help.aliyun.com/zh/sms/user-guide/verification-code-scams-and-message-flooding-1)，了解更多验证码盗刷的防御方式。 | [发送量预警](https://help.aliyun.com/zh/sms/user-guide/configure-alerting-for-messages) [套餐包余量预警](https://help.aliyun.com/zh/sms/user-guide/set-package-allowance-alert#d6aebb1abb4z4) [发送频率预警](https://help.aliyun.com/zh/sms/user-guide/configure-delivery-frequency-and-whitelist) |

## 环境配置

本文以Java语言为例，进行后续操作。更多语言及其SDK安装方式，请参见[安装与使用教程](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?spm=a2c4g.11186623.0.0.a86e4a83bQNvfs&version=2017-05-25&language=java-tea)。

1.  **检查Java环境**：您的Java版本需高于Java 8。Java环境配置的方法，请参见[在Windows搭建Java开发环境](https://help.aliyun.com/zh/sdk/developer-reference/building-a-java-development-environment-in-windows)。
    
2.  **安装SDK**：请通过配置Maven依赖，完成短信服务SDK的安装。
    
    请打开Maven项目的`pom.xml`文件，在`<dependencies>`标签内添加以下信息并将 `the-latest-version` 替换为[最新版本号](https://mvnrepository.com/artifact/com.aliyun/dysmsapi20170525)。保存后请重新加载Maven依赖。
    
    ```
    <dependency>
      <groupId>com.aliyun</groupId>
      <artifactId>dysmsapi20170525</artifactId>
      <!-- 请将 'the-latest-version' 替换为最新版本号：https://mvnrepository.com/artifact/com.aliyun/dysmsapi20170525 -->
      <version>the-latest-version</version>
    </dependency>
    ```
    
3.  **配置环境变量**：为避免代码中显式编码[访问密钥](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair)（AccessKey）而造成泄露，建议您把AccessKey[配置到环境变量](https://help.aliyun.com/zh/sdk/developer-reference/configure-the-alibaba-cloud-accesskey-environment-variable-on-linux-macos-and-windows-systems)，通过环境变量进行读取。配置后**请重启或刷新您的编译运行环境**，包括IDE、命令行界面、其他桌面应用程序及后台服务，以确保最新的系统环境变量成功加载。
    
4.  配置代理（可选）：如果您需要通过代理服务器访问，可通过SDK进行配置，请参见[代理配置](https://help.aliyun.com/zh/sdk/developer-reference/proxy)。
    

## **API基本信息**

短信服务所提供的API基本信息参见如下：

| 接口版本 | [2017-05-25](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-overview) |
| --- | --- |
| [接口风格](https://help.aliyun.com/zh/sdk/product-overview/openapi-style) | RPC |
| [服务接入点](https://help.aliyun.com/zh/openapi/endpoints) (Endpoint) | 中国站请使用 dysmsapi.aliyuncs.com HTTP调用使用端口为80，HTTPS调用使用端口为443 |

建议您在调用API接口前，阅读接口参数规范与使用说明。[在线调试](https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms) | [API文档](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-overview)

## **API调用流程**

![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/1821260871/CAEQVRiBgMDu3qewsxkiIGEwMTBkYzYzYjg5NDQ0YTFiYWM3MzI1OGEyMDI3OWFi4019294_20230927110849.351.svg)

1.  **申请短信资质**：使用[SubmitSmsQualification](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-submitsmsqualification)接口，资质信息需遵守[资质材料说明](https://help.aliyun.com/zh/sms/user-guide/qualification-application-description)。**资质审核通过后才可以申请短信签名**。
    
    -   受短信签名实名制报备要求影响，当前资质审核工单量增长快速，审核时间可能会延长，请耐心等待，**预计2个工作日内完成**。
        
    -   您可以选择使用API接口查看审核状态：使用[QuerySmsQualificationRecord](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-querysmsqualificationrecord)接口查询资质列表，并使用出参`WorkOrderId`调用[QuerySingleSmsQualification](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-querysinglesmsqualification)接口查询指定资质的审核状态。
        
2.  **申请短信签名**：使用[CreateSmsSign](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-createsmssign)接口，签名信息需遵守[短信签名规范](https://help.aliyun.com/zh/sms/user-guide/signature-specifications-1#topic-1820034)。**签名审核通过后才可以申请模板。**
    
    **说明**
    
    调用CreateSmsSign接口时，`QualificationId`（资质ID）为必填参数。请确保已完成资质审核并获取资质ID后再调用该接口。
    
    -   如果您需要申请的签名**用途为他用**，则需在申请签名时上传委托授权书，建议您在申请短信签名前根据[授权书填写规范](https://help.aliyun.com/zh/sms/user-guide/letter-of-authorization-samples)调用[CreateSmsAuthorizationLetter](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-createsmsauthorizationletter)接口创建授权委托书。
        
    -   审核预计2个小时内完成（审核工作时间：周一至周日9:00~21:00，法定节假日顺延）。
        
    -   您可以选择使用接口或[回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)查看审核状态：
        
        | **API接口** | 使用[GetSmsSign](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-getsmssign)接口查询签名状态，或使用[QuerySmsSignList](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-querysmssignlist)接口查询签名列表，根据出参`AuditStatus`判断。 |
        | --- | --- |
        | **回执消息** | > 通过配置回执并开发对接，具体操作请参见[配置回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)，仅支持HTTP批量推送模式。 [SignSmsReport（签名审核状态）](https://help.aliyun.com/zh/sms/developer-reference/signsmsreport#concept-423096) |
        
    -   **签名实名制报备**：新增签名将在审核通过后自动提交报备，存量签名请在[签名管理](https://dysms.console.aliyun.com/domestic/text/sign)页面检查后手动提交报备。**未报备的签名会被运营商拦截发送**。[操作说明](https://help.aliyun.com/zh/sms/user-guide/real-name-reporting-of-sms-sign-name)
        
        **重要**
        
        在未完全完成报备之前，短信可能会发送失败，返回错误码如下：
        
        -   `PORT_NOT_REGISTERED`：当前使用端口号尚未完成企业实名制报备流程。
            
        -   运营商实名报备流程平均需要5-7个工作日，基于近期观测，部分运营商实名报备流程需要7-10个工作日，但运营商未对此时效进行承诺，实际可能需要更长时间。请合理规划业务计划，并在正式使用前提前申请相关资质和签名，预留时间进行发送测试，以确保在正式使用前有充足的时间完成实名报备。
            
        
        若报备失败请按照控制台报备结果详情指引进行操作，详情请参见[签名实名制报备](https://help.aliyun.com/zh/sms/user-guide/real-name-reporting-of-sms-sign-name)。
        
3.  **申请短信模板**：使用[CreateSmsTemplate](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-createsmstemplate)接口，模板内容需遵守[短信模板规范](https://help.aliyun.com/zh/sms/user-guide/message-template-specifications/)。**模板审核通过后才可以发送短信。**
    
    **说明**
    
    调用CreateSmsTemplate接口时，`RelatedSignName`（关联签名名称）为必填参数。请确保已有审核通过的签名，并通过该参数指定签名名称。
    
    -   申请短信模板时关联的签名仅供审核使用，与实际发送短信时使用的签名无关。
        
    -   国内短信模板与国际/港澳台短信模板不通用。
        
    -   审核预计2个小时内完成（审核工作时间：周一至周日9:00~21:00，法定节假日顺延）。
        
    -   您可以选择使用接口或[回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)查看审核状态：
        
        | **API接口** | 使用[GetSmsTemplate](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-getsmstemplate)接口查询模板状态，或使用[QuerySmsTemplateList](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-querysmstemplatelist)接口查询模板列表，根据出参`AuditStatus`判断。 |
        | --- | --- |
        | **回执消息** | > 通过配置回执并开发对接，具体操作请参见[配置回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)，仅支持HTTP批量推送模式。 [TemplateSmsReport（模板审核状态）](https://help.aliyun.com/zh/sms/developer-reference/templatesmsreport) |
        
4.  **发送短信：**使用[SendSms](https://help.aliyun.com/zh/document_detail/101414.html#doc-api-Dysmsapi-SendSms)接口，或使用[SendBatchSms](https://help.aliyun.com/zh/document_detail/102364.html#doc-api-Dysmsapi-SendBatchSms)接口批量发送短信。
    
    -   建议您等待签名报备状态变更为“**已报备待验证”**后再批量发送，您可使用**三大运营商的手机号**、**少量多次**使用该签名[发送](https://dysms.console.aliyun.com/domestic/text/task)验证码、通知短信进行测试。在系统探测期内，建议根据自身情况尽可能多测试发送，若实际测试发送的短信成功率符合预期，则报备状态将变更为“报备成功”。若报备状态不为“报备成功”，请根据[报备验证环节](https://help.aliyun.com/zh/sms/user-guide/real-name-reporting-of-sms-sign-name#eac04163bdspo)内相关指引进行操作。
        
    -   发送短信前确保您账户余额充足。更多详情，请参见[计费概述](https://help.aliyun.com/zh/sms/product-overview/billing-overview)。
        
5.  **查看短信发送详情**：您可使用接口或回执消息查看短信发送详情。
    
    | **API接口** | 使用[QuerySendDetails](https://help.aliyun.com/zh/document_detail/102352.html#doc-api-Dysmsapi-QuerySendDetails)接口查询短信发送状态。 |
    | --- | --- |
    | **回执消息** | > 通过配置回执并开发对接，具体操作请参见[配置回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)。支持以下两种方式： SmsReport（状态报告接收）：[轻量消息队列消费模式](https://help.aliyun.com/zh/sms/developer-reference/smsreport) \\| [HTTP批量推送模式](https://help.aliyun.com/zh/sms/developer-reference/smsreport-http) |
    
6.  **获取用户回复内容**：您发送短信后，用户回复的短信内容即为上行短信，需配置回执消息获取。
    
    | **回执消息** | > 通过配置回执并开发对接，具体操作请参见[配置回执消息](https://help.aliyun.com/zh/sms/developer-reference/configure-delivery-receipts-1)。支持以下两种方式： SmsUp（上行消息接收）：[轻量消息队列消费模式](https://help.aliyun.com/zh/sms/developer-reference/sms-up) \\| [HTTP批量推送模式](https://help.aliyun.com/zh/sms/developer-reference/smsup-http) |
    | --- | --- | --- |
    

更多接口信息，请参见[API概览](https://help.aliyun.com/zh/document_detail/102715.html#concept-t4w-pcs-ggb)。

## **代码示例**

使用SDK发送短信（调用[SendSms](https://help.aliyun.com/zh/document_detail/101414.html#doc-api-Dysmsapi-SendSms)接口）的代码示例如下，请根据注释完成参数填写。

```
package com.aliyun.sample;

import com.aliyun.teaopenapi.models.Config;
import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import static com.aliyun.teautil.Common.toJSONString;

public class Sample {
    public static Client createClient() throws Exception {
        Config config = new Config()
                // 配置 AccessKey ID，请确保代码运行环境设置了环境变量。
                .setAccessKeyId(System.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID"))
                // 配置 AccessKey Secret，请确保代码运行环境设置了环境变量。
                .setAccessKeySecret(System.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET"));
                // System.getenv()方法表示获取系统环境变量，请配置环境变量后，在此填入环境变量名称，不要直接填入AccessKey信息。
        
        // 配置 Endpoint
        config.endpoint = "dysmsapi.aliyuncs.com";

        return new Client(config);
    }

    public static void main(String[] args) throws Exception {
        // 初始化请求客户端
        Client client = Sample.createClient();

        // 构造请求对象，请填入请求参数值
        SendSmsRequest sendSmsRequest = new SendSmsRequest()
                .setPhoneNumbers("1390000****")
                .setSignName("阿里云")
                .setTemplateCode("SMS_15305****")
                .setTemplateParam("{\"name\":\"张三\",\"number\":\"1390000****\"}");

        // 获取响应对象
        SendSmsResponse sendSmsResponse = client.sendSms(sendSmsRequest);

        // 响应包含服务端响应的 body 和 headers
        System.out.println(toJSONString(sendSmsResponse));
    }
}
```

您可以访问 [OpenAPI 门户](https://api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms?tab=DEMO&lang=JAVA)，查看各语言 SDK 请求完整示例。如果您需要自行封装请求来进行API调用，请参见[SendSms](https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-sendsms#%E8%AF%B7%E6%B1%82%E7%A4%BA%E4%BE%8B)和[签名示例代码](https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature#title-h9n-xj6-ue8)。

## **常见问题**

-   [API&SDK常见问题](https://help.aliyun.com/zh/sms/developer-reference/api-sdk-faq)
    
-   [短信发送常见问题](https://help.aliyun.com/zh/sms/user-guide/message-delivery-faq)
    


概述
文档中 SDK 关于 API 的示例代码仅供参考，各 API 的完整使用步骤与说明请参见SDK 示例 和 OpenAPI 文档。
NPM version npm download

环境要求
Node.js >= 8.x
发布地址
https://www.npmjs.com/package/@alicloud/dysmsapi20170525/v/4.5.1
源码仓库地址
https://github.com/aliyun/alibabacloud-typescript-sdk/tree/master/dysmsapi-20170525
安装方式
NPM
npm install --save @alicloud/dysmsapi20170525@4.5.1
示例背景
以下代码详细介绍了通过 TypeScript 和 Node.js 使用阿里云 V2 TypeScript SDK 的步骤，仅作步骤示范。示例展示了如何调用 SendSms API 进行发送短信请求。
完整代码示例
以下为基于 Typescript SDK 提供的示例代码。

Typescript：
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import Credential from '@alicloud/credentials';
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  /**
   * @remarks
   * 使用凭据初始化账号 Client
   * @returns Client
   * 
   * @throws Exception
   */
  static createClient(): Dysmsapi20170525 {
    // 工程代码建议使用更安全的无 AK 方式，凭据配置方式请参见：https://help.aliyun.com/document_detail/378664.html。
    let credential = new Credential();
    let config = new $OpenApi.Config({
      credential: credential,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
    config.endpoint = `dysmsapi.aliyuncs.com`;
    return new Dysmsapi20170525(config);
  }

  static async main(args: string[]): Promise<void> {
    let client = Client.createClient();
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: "your_value",
      signName: "your_value",
    });
    try {
      let resp = await client.sendSmsWithOptions(sendSmsRequest, new $Util.RuntimeOptions({ }));
      console.log(JSON.stringify(resp, null, 2));
    } catch (error) {
      // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
      // 错误 message
      console.log(error.message);
      // 诊断地址
      console.log(error.data["Recommend"]);
    }    
  }

}

Client.main(process.argv.slice(2));
Node.js
'use strict';
// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');
const Tea = require('@alicloud/tea-typescript');

class Client {

  /**
   * 使用凭据初始化账号 Client
   * @return Client
   * @throws Exception
   */
  static createClient() {
    // 工程代码建议使用更安全的无 AK 方式，凭据配置方式请参见：https://help.aliyun.com/document_detail/378664.html。
    let credential = new Credential.default();
    let config = new OpenApi.Config({
      credential: credential,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
    config.endpoint = `dysmsapi.aliyuncs.com`;
    return new Dysmsapi20170525.default(config);
  }

  static async main(args) {
    let client = Client.createClient();
    let sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: 'your_value',
      signName: 'your_value',
    });
    try {
      let resp = await client.sendSmsWithOptions(sendSmsRequest, new Util.RuntimeOptions({ }));
      console.log(JSON.stringify(resp, null, 2));
    } catch (error) {
      // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
      // 错误 message
      console.log(error.message);
      // 诊断地址
      console.log(error.data["Recommend"]);
    }    
  }

}

exports.Client = Client;
Client.main(process.argv.slice(2));
步骤介绍
初始化配置对象 @alicloud/openapi-client.Config 。 Config 对象存放 credential、endpoint 等配置，endpoint 如示例中的 dysmsapi.aliyuncs.com 。

注意：工程代码建议使用更安全的无 AK 方式

先实例化 @alicloud/credentials.Credential 对象，设置到 Config 中的 credential 字段，阿里云 SDK 将会尝试按照默认凭据链的顺序查找相关凭据信息。

更多凭据配置方式请参阅：管理访问凭据

TypeScript:
let credential = new Credential();
let config = new $OpenApi.Config({
credential: credential
});
// 访问的域名
config.endpoint = "dysmsapi.aliyuncs.com";
Node.js:
let credential = new Credential.default();
let config = new OpenApi.Config({
  credential: credential,
});
// The endpoint.
config.endpoint = "dysmsapi.aliyuncs.com";
实例化一个客户端，从 @alicloud/dysmsapi20170525 类生成对象 client 。 Client 对象要求入参 Config。
TypeScript:

// import Client, * as $dysmsapi from "@alicloud/dysmsapi20170525";

// 创建客户端
const client = new Client(config);
Node.js:

// const Client = require('@alicloud/dysmsapi20170525');

// 创建客户端
const client = new Client(config);
创建对应 API 的 Request 。 类的命名规则为 API 方法名加上 Request 。例如：
TypeScript:

let request = new $dysmsapi.SendSmsRequest({ });

// 该参数值为假设值，请您根据实际情况进行填写
request.phoneNumbers = "your_value";

// 该参数值为假设值，请您根据实际情况进行填写
request.signName = "your_value";

Node.js:

let request = new dysmsapi.SendSmsRequest({ });

// 该参数值为假设值，请您根据实际情况进行填写
request.phoneNumbers = "your_value";

// 该参数值为假设值，请您根据实际情况进行填写
request.signName = "your_value";

通过 client 对象获得对应 request 响应 response，Node.js 同 TypeScript 方式一致：
const response = await client.sendSms(request);
调用 response 中对应的属性获得返回的参数值，Node.js 同 TypeScript 方式一致： 假设您需要获取 requestId ;
console.log(response.body.requestId);
获取报错信息
catch (ex) {
console.log(ex);
}
