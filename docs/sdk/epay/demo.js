

// 引入index.js文件
const Epay = require('epay-node-sdk');

const  epayConfig = { 
    domain: 'https://epay.cc', // 易支付接口，需带协议http://或https://
    pid: 1000, // 对接id
    key: '1111111' // 对接密钥
};
/**
 * 实例化易支付类
 */
const epay = new Epay(epayConfig);

//发起支付
const payConfig = {
    type: 'alipay',
    out_trade_no: new Date().getTime().toString(),
    notify_url: 'http://localhost/notify_url.php',
    return_url: 'http://localhost/return_url.php',
    name: '商品名称',
    money: '0.01',
    clientip: '127.0.0.1',
};
console.log(epay.pay(payConfig));

/**
 * API-查询商户信息与结算规则
 */

正确使用Promise的方式
epay.query()
    .then(data => {
        console.log('查询结果:', data);
    })
    .catch(error => {
        console.error('查询失败:', error);
    });

/**
 * API-修改结算账号 如果商家关闭修改接口，此时将会返回html字符串
 * @param {String} account 支付宝账号
 * @param {String} username 支付宝姓名
 */
epay.change('13300000000', '麻花腾')
    .then(data => {
        console.log('修改结果:', data);
    })
    .catch(error => {
        console.error('修改失败:', error);
    });

/**
 * API-查询结算记录
 */
epay.settle()
    .then(data => {
        console.log('结算记录:', data);
    })
    .catch(error => {
        console.error('查询结算记录失败:', error);
    });

/**
 * API-查询单个订单
 * @param {String} out_trade_no 商家订单号
 */
epay.order('2025112301000917581')
    .then(data => {
        console.log('订单详情:', data);
    })
    .catch(error => {
        console.error('查询订单失败:', error);
    });

/**
 * API-批量查询订单
 */
epay.orders()
    .then(data => {
        console.log('批量订单:', data);
    })
    .catch(error => {
        console.error('批量查询订单失败:', error);
    });