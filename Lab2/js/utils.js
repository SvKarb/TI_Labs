const Utils = {
    groupBits(str) {
        if (!str) return "";
        const bytes = str.match(/.{1,8}/g);
        const lines = [];
        for (let i = 0; i < bytes.length; i += 8) {
            lines.push(bytes.slice(i, i + 8).join(' '));
        }
        return lines.join('\n');
    },

    bufferToBitString(buffer) {
        let bits = "";
        for (let i = 0; i < buffer.length; i++) {
            bits += buffer[i].toString(2).padStart(8, '0');
        }
        return bits;
    },

    formatSymmetricPreview(bitString, limit = 144) {
        if (bitString.length <= limit * 2) {
            return this.groupBits(bitString);
        }

        const start = bitString.substring(0, limit);
        const end   = bitString.substring(bitString.length - limit);

        return `${this.groupBits(start)}\n...\n${this.groupBits(end)}`;
    },

    download(buffer, name) {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }
};