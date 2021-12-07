const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = "-----";
const bot = new TelegramBot(token, { polling: true });

function getCoinData(t,msg) {
    // 当前时间
    let newZDate = new Date();
    let strTime = `${newZDate.getFullYear()}-${(newZDate.getMonth() + 1) > 9 ? (newZDate.getMonth() + 1) : '0' + (newZDate.getMonth() + 1)}-${newZDate.getDate() > 9 ? newZDate.getDate() : '0' + newZDate.getDate()} ${newZDate.getHours() > 9 ? newZDate.getHours() : '0' + newZDate.getHours()}:${newZDate.getMinutes() > 9 ? newZDate.getMinutes() : '0' + newZDate.getMinutes()}:${newZDate.getSeconds() > 9 ? newZDate.getSeconds() : '0' + newZDate.getSeconds()}`;
    request('https://api.coingecko.com/api/v3/coins/'+t, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let clone = JSON.parse(body) //格式转换一下
            let symbol = clone.symbol.toUpperCase(); //货币编号大写
            let cnyPrice = clone.market_data.current_price.cny;  //人民币价格
            let usdPrice = clone.market_data.current_price.usd;  //美元价格
            let price_change_24h = clone.market_data.price_change_percentage_24h; //24小时涨幅
            // 字符串拼接
            let str = `
            币种名称: ${symbol} \n🇨🇳${symbol}全网价格: ¥${cnyPrice}\n🇺🇸美元价格: $${usdPrice}\n24小时涨幅: ${price_change_24h}%\n${strTime}
            `
            bot.sendMessage(msg.chat.id,str);
        } else {
            bot.sendMessage(msg.chat.id,"系统异常!");
            console.log(response, body);

        }
    })
}


function getCoinId(t,msg) {
    // https://api.coingecko.com/api/v3/coins/list
    request('https://api.coingecko.com/api/v3/coins/list', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let clone = JSON.parse(body);
            let coinId = '';
            // 找出发送货币代号ID
            for (let index = 0; index < clone.length; index++) {
                if (clone[index].symbol == t) {
                    coinId = clone[index].id;
                    break; //找到就停止循环
                }
            }
            if(coinId == ''){
                bot.sendMessage(msg.chat.id,"请发送正确的指令!");
            }else {
                getCoinData(coinId,msg)
            }
        } else {
            bot.sendMessage(msg.chat.id,"系统异常!");
            console.log(response, body);
        }
    })
}

// 两个初始化的帮助命令
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "您可直接发送货币代号,即可获得最新货币价格! 例如: /price eth");
});
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "您可直接发送货币代号,即可获得最新货币价格! 例如: /price eth");
});

// 监听消息
bot.on('message', (msg) => {
    let msgText = msg.text;
    let instruction = msgText.substring(0,6);
    if(instruction == '/price'){
        let coin = msgText.split(' ');
        let selectCoin = [];
        coin.splice(0,1);
        coin.forEach((v,i)=>{
            if(v != ''){
                selectCoin.push(v)
            }
        })
        if(selectCoin.length == 0){
            bot.sendMessage(msg.chat.id,"请发送正确的指令!");
        }else {
            getCoinId(selectCoin[0].toLowerCase(),msg)
        }
    }
}); 