`use strict`;

const net = require("net");
const Client = require("../jsonrpc");
const server = new net.Server();
let client = null;
let counter = 1;

beforeAll((done) => {
    server.on('listening', () => done());
    server.on('connection', (socket) => {
        socket.on('data', (data) => {
            console.log('<<<', data.toString());
            socket.write(data);
            console.log('>>>', data.toString());
        });
    });
    server.listen(3333, '127.0.0.1');
});


it('Constructor', () => {
    client = new Client();
});

it('Connect', async () => {
    const result = await client.connect();
    expect(result).toBe('ok');
});

it('Call', async () => {
    const result = await client.call('test', []);
    console.log('call:', result);
    expect(result).toEqual({"id": counter++, "method": "test", "params": []});
});

afterAll((done) => {
    client.close();
    server.close(done);
});