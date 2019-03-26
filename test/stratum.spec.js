`use strict`;

const net = require("net");
const JsonParse = require("jsonparse");
const server = new net.Server();
let stratum = null;
let counter = 1;
jest.setTimeout(10000);

beforeAll((done) => {
    server.on('listening', () => done());
    server.on('connection', (socket) => {
        const parser = new JsonParse();
        parser.onValue = (data) => {
            console.log(data);
            const response = {
                id: data.id,
                error: null
            };
            switch (data.command) {
                case "mining.subscribe":
                    socket.write(JSON.stringify({
                        id: null,
                        method: "mining.notify",
                        params: ["bf", "4d16b6f85af6e2198f44ae2a6de67f78487ae5611b77c6c0440b921e00000000",
                            "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff20020862062f503253482f04b8864e5008",
                            "072f736c7573682f000000000100f2052a010000001976a914d23fcdf86f7e756a64a7a9688ef9903327048ed988ac00000000", [],
                            "00000002", "1c2ac4af", "504e86b9", false]
                    } + "\n"), () => {
                        console.log('>>>', data);
                    });
                    response.result = [[["mining.set_difficulty", "b4b6693b72a50c7116db18d6497cac52"], ["mining.notify", "ae6812eb4cd7735a302a8a9dd95cf71f"]], "08000002", 4];
                break;
                case "mining.authorize":
                    response.result = true;
                break;
                case "mining.submit":
                    response.result = true;
                break;
            }
            console.log(response);
            if(response.result) {
                socket.write(JSON.stringify(response) + "\n", () => {
                    console.log('>>>', response);
                });
            }
        };
        socket.on('data', (data) => {
            console.log('<<<', data.toString('utf8'));
            parser.write(data);
        });
    });
    server.listen(3333, '127.0.0.1');
});

it('Client constructor', () => {
    stratum = require("../stratum")({
        // host: 'grlcgang.com',
        host: 'scrypt.usa.nicehash.com',
        // host: '127.0.0.1',
        port: 3333,
        worker: {
            name: '15RrZ98B9dF2CqD4yqhYSkjGLVTPZ2sasx',
            pass: 'x',
            subscribe: 'bench.tester'
        }
    });
});

it('Client connect', async () => {
    const result = await stratum.connect();
    expect(result).toBe('ok');
});

it('Client subscribe', async () => {
    const result = await stratum.subscribe();
    console.log('subscribe:', result);
    stratum.worker.extranonce2 = result.result[1];
    expect(result).toMatchObject({ id: counter++, error: null });
});

it('Client authorize', async () => {
    const result = await stratum.authorize();
    console.log('authorize:', result);
    expect(result).toEqual({ id: counter++, result: true, error: null });
});

it('Client submit', async () => {
    const result = await stratum.submit();
    console.log('submit:', result);
    expect(result).toEqual({ id: counter++, result: true, error: null });
});


afterAll((done) => {
    stratum.close();
    server.close(done);
});
