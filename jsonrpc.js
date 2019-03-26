`use strict`;

const net = require("net");

class Client {

    /**
     * Constructor
     * @param options
     */
    constructor(options) {
        this.opts = options || {};
        this.socket = new net.Socket();
        // id in rpc
        this.counter = 1;
        this.pool = new Map();
        this.timer = null;
        this.socket.setEncoding("utf8");
        this.socket.setTimeout(3000);
    }

    /**
     * Connect
     * @return {Promise<any>}
     */
    connect() {
        return new Promise(((resolve, reject) => {
            this.socket.on('timeout', () => {
                const error = new Error('Socket timeout');
                console.error(error);
                this.socket.end();
                reject(error);
            });
            let incomingData = '';
            this.socket.on("data", data => {
                incomingData += data.toString('utf8');
                const chunks = incomingData.split('\n');
                incomingData = chunks[chunks.length - 1];
                for (let i = 0; i < chunks.length - 1; i++) {
                    try {
                        let obj = JSON.parse(chunks[i]);
                        this.data(obj);
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
            this.socket.on("close", () => {
                if(this.timer) clearTimeout(this.timer);
                this.close();
            });
            this.socket.on("error", error => {
                if(this.timer) clearTimeout(this.timer);
                console.error(error);
                if(!this.socket.connecting) reject(error);
            });
            this.socket.on("ready", () => {
                resolve('ok');
            });
            // connect
            this.socket.connect({
                host: this.opts.host || 'localhost',
                port: this.opts.port || 3333
            });
        }));
    }

    /**
     * Call method RPC
     * @param method
     * @param params
     */
    call(method, params) {
        return new Promise((resolve, reject) => {
            let request = {
                id: this.counter++,
                params,
                method
            };
            this.socket.write(JSON.stringify(request)+"\n", (error) => {
                if(error) reject(error);
                this.pool.set(request.id, (jsonData) => {
                    this.pool.delete(request.id);
                    resolve(jsonData);
                });
            });
            this.timer = setTimeout(() => {
                const error = new Error("Timeout request");
                console.error(error);
                reject(error);
            }, this.opts.timeout || 60000);
        });
    }

    /**
     * Received data from socket
     * @param jsonData
     */
    data(jsonData) {
        if(jsonData.id && this.pool.has(jsonData.id))
            this.pool.get(jsonData.id)(jsonData);
    }

    /**
     * Close socket
     */
    close() {
        this.pool = new Map();
        this.socket.end();
        this.socket.destroy();
    }

}
module.exports = Client;