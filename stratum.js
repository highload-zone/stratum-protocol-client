`use strict`;

const Client = require("./jsonrpc");

class Stratum extends Client {

    constructor(options) {
        super(options);
        this.worker = options.worker || {
            name: 'test',
            pass: 'test',
            subscribe: 'Benchmark tester'
        };
    }

    subscribe() {
        return this.call('mining.subscribe', [this.worker.subscribe]);
    }

    authorize() {
        return this.call('mining.authorize', [this.worker.name, this.worker.pass]);
    }

    submit() {
        // ["<worker.name>", "<jobID>", "<ExtraNonce2>", "<ntime>", "<nonce>"]
        return this.call('mining.submit', [this.worker.name, this.worker.jobId, this.worker.extranonce2, this.worker.ntime, this.worker.extranonce2]);
    }

    data(jsonData) {
        super.data(jsonData);
        const key = jsonData.method || jsonData.id;
        const { error, result, params } = jsonData;
        if(error) throw new Error(error);
        switch(key) {
            case "mining.authorize":
                //
            break;

            case "mining.set_difficulty":
                //
            break;

            case "mining.notify":
                let index = -1;
                this.worker = {
                    ...this.worker,
                    jobId:          params[++index],
                    prevhash:       params[++index],
                    coinb1:         params[++index],
                    coinb2:         params[++index],
                    merkle_branch:  params[++index],
                    version:        params[++index],
                    nbits:          params[++index],
                    ntime:          params[++index],
                    clean_jobs:     params[++index],
                };
                console.log('mining.notify', this.worker);
            break;

            // default:
                // console.error("Undefined method '" + key + "'", jsonData);
        }
    }
}

module.exports = (options) => new Stratum(options);