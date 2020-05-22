export function applyMask(value: number, mask: number, maskOffset = 0) {
    return (value & mask) >>> maskOffset;
}
