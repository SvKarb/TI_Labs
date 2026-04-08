document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const stateInput = document.getElementById('initialState');

    clearBtn.addEventListener('click', () => {
        fileInput.value = "";
        document.getElementById('fileName').textContent = "Нажмите для выбора файла";
        document.getElementById('keyOutput').textContent = "Ожидание...";
        document.getElementById('originalBinOutput').textContent = "Ожидание...";
        document.getElementById('encryptedBinOutput').textContent = "Ожидание...";
        stateInput.value = "111111111111111111111111111111";
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) document.getElementById('fileName').textContent = fileInput.files[0].name;
    });

    processBtn.addEventListener('click', () => {
        let seedStr = stateInput.value;
        if (!seedStr) return alert("Введите ключ");
        
        if (/^0+$/.test(seedStr)) {
            return alert("Ошибка: Ключ не может состоять только из нулей! Это приведет к тому, что файл не будет зашифрован.");
        }

        seedStr = seedStr.padEnd(30, '0');
        stateInput.value = seedStr;

        const file = fileInput.files[0];
        if (!file) return alert("Выберите файл");

        const reader = new FileReader();
        reader.onload = (e) => {
            const inBuf = new Uint8Array(e.target.result);
            const outBuf = new Uint8Array(inBuf.length);
            const seed = seedStr.split('').map(Number);
            
            const lfsr = new LFSR(seed);
            const totalBits = inBuf.length * 8;

            for (let i = 0; i < inBuf.length; i++) {
                let keyByte = 0;
                for (let b = 0; b < 8; b++) {
                    keyByte = (keyByte << 1) | lfsr.nextBit();
                }
                outBuf[i] = inBuf[i] ^ keyByte;
            }

            const keyLfsr = new LFSR(seed);
            let keyBits = "";
            if (totalBits <= 288) {
                for (let i = 0; i < totalBits; i++) keyBits += keyLfsr.nextBit();
            } else {
                for (let i = 0; i < 144; i++) keyBits += keyLfsr.nextBit();
                for (let i = 0; i < totalBits - 288; i++) keyLfsr.nextBit();
                for (let i = 0; i < 144; i++) keyBits += keyLfsr.nextBit();
            }

            const inBits = Utils.bufferToBitString(inBuf);
            const outBits = Utils.bufferToBitString(outBuf);

            document.getElementById('originalBinOutput').textContent = Utils.formatSymmetricPreview(inBits);
            document.getElementById('keyOutput').textContent =
                totalBits <= 288
                    ? Utils.groupBits(keyBits)
                    : Utils.groupBits(keyBits.substring(0, 144)) + '\n...\n' + Utils.groupBits(keyBits.substring(144));
            document.getElementById('encryptedBinOutput').textContent = Utils.formatSymmetricPreview(outBits);

            let outputFileName;
            if (file.name.endsWith('.enc')) {
                let baseName = file.name.slice(0, -4); 
                if (baseName.startsWith('encrypted_')) {
                    baseName = baseName.slice(10); 
                }
                outputFileName = 'decrypted_' + baseName; 
            } else {
                outputFileName = 'encrypted_' + file.name + '.enc';
            }

            Utils.download(outBuf, outputFileName);
        };
        reader.readAsArrayBuffer(file);
    });
});