 /**
 * @author eKing
 * @version 1.0.0
 */

const {
    createHash
} = require('crypto');

const request = require('request');
const rp = require('request-promise');

/**
 * JS版对象排序
 * @param {Object} inputArr 对象
 * @param {*} sort_flags 
 */
const ksort = function (inputArr, sort_flags) {
    var tmp_arr = {},
        keys = [],
        sorter, i, k, that = this,
        strictForIn = false,
        populateArr = {};

    switch (sort_flags) {
        case 'SORT_STRING':
            // compare items as strings
            sorter = function (a, b) {
                return that.strnatcmp(a, b);
            };
            break;
        case 'SORT_LOCALE_STRING':
            // compare items as strings, original by the current locale (set with  i18n_loc_set_default() as of PHP6)
            var loc = this.i18n_loc_get_default();
            sorter = this.php_js.i18nLocales[loc].sorting;
            break;
        case 'SORT_NUMERIC':
            // compare items numerically
            sorter = function (a, b) {
                return ((a + 0) - (b + 0));
            };
            break;
        // case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                var aFloat = parseFloat(a),
                    bFloat = parseFloat(b),
                    aNumeric = aFloat + '' === a,
                    bNumeric = bFloat + '' === b;
                if (aNumeric && bNumeric) {
                    return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
                } else if (aNumeric && !bNumeric) {
                    return 1;
                } else if (!aNumeric && bNumeric) {
                    return -1;
                }
                return a > b ? 1 : a < b ? -1 : 0;
            };
            break;
    }

    // Make a list of key names
    for (k in inputArr) {
        if (inputArr.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    keys.sort(sorter);

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js
        .ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;

    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        k = keys[i];
        tmp_arr[k] = inputArr[k];
        if (strictForIn) {
            delete inputArr[k];
        }
    }
    for (i in tmp_arr) {
        if (tmp_arr.hasOwnProperty(i)) {
            populateArr[i] = tmp_arr[i];
        }
    }

    return strictForIn || populateArr;
}

/**
 * @param {string} algorithm
 * @param {any} content
 *  @return {string}
 */
const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('hex')
}

/**
 * @param {any} content
 *  @return {string}
 */
const md5 = (content) => encrypt('md5', content)

class Epay {
    /**
     * @param  {String} options.domain     商家请求域名 例：http://pay.hackwl.cn
     * @param  {String} options.pid        对接ID
     * @param  {String} options.key        对接密钥
     */
    constructor({
        domain,
        pid,
        key
    }) {
        this.domain = domain,
            this.pid = pid;
        this.key = key;
    }

    /**
     * API-查询商户信息与结算规则
     */
    query() {
        var config = {
            act: 'query'
        };

        var url = `${this.domain}/api.php?act=${config.act}&pid=${this.pid}&key=${this.key}`;
        return rp(url).then(res => {
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (e) {
                // 如果解析失败，抛出包含原始响应的错误
                throw new Error(`JSON解析失败: ${res}`);
            }
        }).catch(error => {
            console.error('query API调用失败:', error);
            throw error;
        });
    }

    /**
     * API-修改结算账号 如果商家关闭修改接口，此时将会返回html字符串
     * @param {String} account 支付宝账号
     * @param {String} username 支付宝姓名
     */
    change(account, username) {
        var config = {
            act: 'change'
        }

        var url = `${this.domain}/api.php?act=${config.act}&pid=${this.pid}&key=${this.key}&account=${account}&username=${username}`

        return rp(url).then(res => {
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (e) {
                // 如果解析失败，返回原始响应（可能是HTML）
                return res;
            }
        }).catch(error => {
            console.error('change API调用失败:', error);
            throw error;
        });
    }

    /**
     * API-查询结算记录
     */
    settle() {
        var config = {
            act: 'settle'
        }

        var url = `${this.domain}/api.php?act=${config.act}&pid=${this.pid}&key=${this.key}`

        return rp(url).then(res => {
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (e) {
                throw new Error(`JSON解析失败: ${res}`);
            }
        }).catch(error => {
            console.error('settle API调用失败:', error);
            throw error;
        });
    }

    /**
     * API-批量查询订单
     */
    orders() {
        var config = {
            act: 'orders'
        }

        var url = `${this.domain}/api.php?act=${config.act}&pid=${this.pid}&key=${this.key}`

        return rp(url).then(res => {
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (e) {
                throw new Error(`JSON解析失败: ${res}`);
            }
        }).catch(error => {
            console.error('orders API调用失败:', error);
            throw error;
        });
    }

    /**
     * API-查询单个订单
     * @param {String} out_trade_no 商家订单号
     */
    order(out_trade_no) {
        var config = {
            act: 'order'
        }

        var url = `${this.domain}/api.php?act=${config.act}&pid=${this.pid}&key=${this.key}&out_trade_no=${out_trade_no}`

        return rp(url).then(res => {
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (e) {
                throw new Error(`JSON解析失败: ${res}`);
            }
        }).catch(error => {
            console.error('order API调用失败:', error);
            throw error;
        });
    }

    /**
     * API-二维码下单接口
     * args示例
     * {  
     *    type: 'alipay',
     *    out_trade_no: '1578828234686',
     *    notify_url: 'http://域名/notify_url.php',
     *    name: '测试',
     *    money: '0.01',
     *    sitename: '测试网站'
     * }
     */
    pay(args) {
        // 支付宝签名算法：https://docs.open.alipay.com/common/104741
        var config = {
            pid: this.pid,
            ...args
        }
        // 重新排序对象 按照首字符开始排序
        const obj = ksort(config); //

        var sign = "";

        // 拼接签名字符串
        for (var key in obj) {
            sign += obj[key] == '' ? '' : key + "=" + obj[key] + "&";
        }

        // 去掉最后一个&字符并进行md5加密
        sign = md5(sign.substring(0, sign.length - 1) + this.key);
        // 构造POST请求体
        const formData = {
            pid: this.pid,
            type: config.type,
            out_trade_no: config.out_trade_no,
            notify_url: config.notify_url,
            name: config.name,
            money: config.money,
            clientip: '127.0.0.1',
            sign: sign,
            sign_type: 'MD5'
        };

        const options = {
            uri: `${this.domain}/mapi.php`,
            method: 'POST',
            form: formData
        };

        return rp(options).then(res => {
            // 尝试解析JSON响应
            try {
                const jsonResponse = JSON.parse(res);
                return jsonResponse;
            } catch (error) {
                // 如果解析失败，返回原始响应
                
                return res;
            }
        }).catch(error => {
            
            throw error; // 重新抛出错误，让外部可以捕获
        });
    } 
}

module.exports = Epay
