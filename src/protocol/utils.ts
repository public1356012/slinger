export function increaseModulus(value: number, by: number) {
    return value + (value < 0 ? -by : by);
}

export function areBytesMissing(buffer: Buffer, bufferOffset: number, bytes: number) {
    return buffer.byteLength - bufferOffset < bytes;
}

export function isByteMissing(buffer: Buffer, bufferOffset: number) {
    return buffer.byteLength - bufferOffset < 1;
}

export function applyMask(value: number, mask: number, maskOffset = 0) {
    return (value & mask) >>> maskOffset;
}
