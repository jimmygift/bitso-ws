/*

Open websocket to bitso cryptoexchange
Subscribe to BTC/MXN pair feed
Dump timeseries to InfluxDB

*/

const { ifxdb_token, ifxdb_org, ifxdb_bucket, ifxdb_url } = require('./config');
const { hostname } = require('os');

const WebSocket  = require('ws');
const {InfluxDB} = require('@influxdata/influxdb-client');
const {Point} = require('@influxdata/influxdb-client');

const ifxdb_client = new InfluxDB({url: ifxdb_url, token: ifxdb_token});
const ifxdb_write  = ifxdb_client.getWriteApi(ifxdb_org, ifxdb_bucket);

const wss = new WebSocket('wss://ws.bitso.com');

wss.onopen = function() {
    wss.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'trades' }));
    //wss.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'diff-orders' }));
    //wss.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'orders' }));
};


wss.onmessage = function(message){
    var data = JSON.parse(message.data);

    if (data.type == "ka") {
        // Keepalive
        
    } else if (data.type == 'trades' && data.payload) {
        // Trades feed 
        console.log(JSON.stringify(data.payload));

        const payload = data.payload;
        const trade = payload[0];

        const trade_id     = trade.i	    // Unique number identifying the transaction	
        const trade_amount = trade.a	    // Amount	Major
        const trade_rate   = trade.r	    // Rate	Minor
        const trade_value  = trade.v	    // Value	Minor
        const trade_t	   = trade.t	    // Maker side, 0 indicates buy 1, indicates sell	
        const trade_mo     = trade.mo	    // Maker Order ID	
        const trade_to	   = trade.token    // Taker Order ID        

        const point = new Point('trade')
            .tag('h', hostname)
            .tag('t', trade_t)
            .floatField('i', trade_id)
            .floatField('a', trade_amount)
            .floatField('r', trade_rate)  
            .floatField('v', trade_value)
            .stringField('mo', trade_mo)
            .stringField('to', trade_to)
            
        ifxdb_write.writePoint(point);

    } else if (data.type == 'diff-orders' && data.payload) {

        //console.log(JSON.stringify(data.payload));

    } else if (data.type == 'orders' && data.payload) {
        // Orders feed
        // contains one array of bids, and one array of asks

        const payload = data.payload;
        const book = payload.book;
        const bids = payload.bids;
        const asks = payload.asks;

        for(i in bids) {
            const bid_order = bids[i];

            const order  = bid_order.order;
            const rate   = bid_order.r;
            const amount = bid_order.a;
            const buy_or_sell = bid_order.t;    // 0 indicates buy 1 indicates sell
            const date = bid_order.d;           // Unix timestamp	Milliseconds
            const s = bid_order.s;

            const point = new Point('order')
                .tag('h', hostname)
                .tag('b', book)
                .stringField('o', order)
                .floatField('a', rate)
                .floatField('r', amount)
                .tag('t', buy_or_sell)
                .floatField('d', date)
                .timestamp(new Date());
            
            ifxdb_write.writePoint(point);
        }

        for(i in asks) {
            const ask_order = bids[i];

            const order  = ask_order.order;
            const rate   = ask_order.r;
            const amount = ask_order.a;
            const buy_or_sell = ask_order.t;    // 0 indicates buy 1 indicates sell
            const date = ask_order.d;           // Unix timestamp	Milliseconds
            const s = ask_order.s;

            const point = new Point('order')
                .tag('h', hostname)
                .tag('b', book)
                .stringField('o', order)
                .floatField('a', rate)
                .floatField('r', amount)
                .intField('t', buy_or_sell)
                .floatField('d', date)
                .timestamp(new Date());
            
            ifxdb_write.writePoint(point);
        }

        //console.log(JSON.stringify(data.payload));
    }

}
