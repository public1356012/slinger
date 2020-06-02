const net = require('net');


const buff2 = Buffer.alloc(2);

// buff2.writeUInt8(0b00000000);
// buff2.writeUInt8(0b10110000, 1);
// const dataSender = setInterval(() => {
//     client.write(buff2);
// }, 100);

const client = net.createConnection(4545, () => {
    console.log('Connection made!');

    const buff = Buffer.alloc(Buffer.byteLength('zęby :)') + 2);

    buff.writeUInt8(0b00010010);
    buff.writeUInt8(Buffer.byteLength('zęby :)'), 1);
    buff.write('zęby :)', 2);

    client.write(buff);
});

client.on('positions', (Position) => {
});
client.on('close', () => {
    clearInterval(dataSender);
    console.log('Connection closed');
});


function ack2(buffer) {
    const head = buffer.readUInt8(0);
    const zoneSize = buffer.readFloatLE(1);
    const tickRate = buffer.readUInt8(5);
    const playerId = buffer.readUInt16LE(6);
    const usernameLen = buffer.readUInt8(8);
    const username = buffer.toString('utf8', 9, usernameLen + 9);

    console.log(head, zoneSize, tickRate, playerId, usernameLen, username);
}
function ack(buffer) {
    const head = buffer.readUInt8(0);
    const siz = buffer.readUInt8(1);
    console.log(head, siz);
    if (head == 5) {
        for (let i = 0; i < siz; i++) {
            const zoneSize = buffer.readUInt16LE(10 * i + 2);
            const tickRate = buffer.readFloatLE(10 * i + 4);
            const playerId = buffer.readFloatLE(10 * i + 8);
            console.log(zoneSize, tickRate, playerId);
        }
    }
    if (head == 9) {
        const sizer = buffer.readUInt16LE(2);
        console.log(head, siz);
        let count = 4;
        for (let i = 0; i < siz; i++) {
            const playerId = buffer.readUInt16LE(count);
            count += 2;
            const usernameLen = buffer.readUInt8(count);
            i += playerId;
            console.log(usernameLen);
            count += 1;
            const username = buffer.toString('utf8', count, usernameLen + count);
            //count += usernameLen;
            console.log(playerId, usernameLen, username);
        }
    }
    // const usernameLen = buffer.readUInt8(8);
    // const username = buffer.toString('utf8', 9, usernameLen + 9);

}

client.on('data', data => ack(data));

