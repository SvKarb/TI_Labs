function handleFindRoots() {
    const pRaw = document.getElementById('inputP').value.trim();
    const p = BigInt(pRaw);

    // Проверка: p должно быть простым
    if (!isPrime(p)) {
        alert(`Ошибка: ${pRaw} не является простым числом!`);
        return;
    }

    if (p <= 256n) {
        alert("Ошибка: Число p должно быть не меньше 256 для корректной работы с байтами файла!");
        return;
    }

    const selectG = document.getElementById('selectG');
    const rootsSection = document.getElementById('rootsSection');
    const rootsCountLabel = document.getElementById('rootsCount');

    selectG.innerHTML = '';

    const phi = p - 1n;
    const factors = getPrimeFactors(phi); 
    let rootsFound = 0;

    // Ищем все первообразные корни по модулю p
    for (let g = 2n; g < p; g++) {
        let isRoot = true;
        for (let q of factors) {
            if (fastExp(g, phi / q, p) === 1n) { 
                isRoot = false;
                break;
            }
        }
        if (isRoot) {
            let opt = document.createElement('option');
            opt.value = g;
            opt.innerText = g;
            selectG.appendChild(opt);
            rootsFound++;
        }
    }

    rootsCountLabel.innerText = `Найдено первообразных корней: ${rootsFound}`;
    rootsSection.classList.remove('hidden');
}

async function processFile(mode) {
    const pRaw = document.getElementById('inputP').value.trim();
    const p = BigInt(pRaw);
    const g = BigInt(document.getElementById('selectG').value);
    const x = BigInt(document.getElementById('inputX').value);
    const k = BigInt(document.getElementById('inputK').value);
    const fileInput = document.getElementById('fileInput');
    
    const outputDisplay = document.getElementById('outputDisplay');
    const inputDisplay = document.getElementById('inputDisplay');

    if (x <= 1n || x >= p - 1n) {
        alert(`Ошибка: секретный ключ x должен быть в диапазоне 1 < x < ${p - 1n}`);
        return;
    }

    if (k <= 1n || k >= p - 1n) {
        alert(`Ошибка: сессионный ключ k должен быть в диапазоне 1 < k < ${p - 1n}`);
        return;
    }
    if (gcd(k, p - 1n) !== 1n) {
        alert(`Ошибка: k и p-1 должны быть взаимно простыми`);
        return;
    }

    if (!fileInput.files[0]) return alert("Выберите файл!");
    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (mode === 'encrypt') {

        inputDisplay.value = Array.from(bytes).join(' ');
    
        let displayParts = [];
        const y = fastExp(g, x, p);
        
        const nameBytes = new TextEncoder().encode(file.name);
        const binBuffer = new Uint8Array(2 + nameBytes.length + bytes.length * 4);
        
        binBuffer[0] = (nameBytes.length >> 8) & 0xff;
        binBuffer[1] = nameBytes.length & 0xff;
        binBuffer.set(nameBytes, 2);
        
        let binOffset = 2 + nameBytes.length;

        for (let mByte of bytes) {
            const m = BigInt(mByte);
            const a = fastExp(g, k, p);
            const b = (fastExp(y, k, p) * m) % p;

            const aNum = Number(a);
            const bNum = Number(b);

            displayParts.push(`${aNum} ${bNum}`);

            binBuffer[binOffset++] = (aNum >> 8) & 0xff;
            binBuffer[binOffset++] = aNum & 0xff;
            binBuffer[binOffset++] = (bNum >> 8) & 0xff;
            binBuffer[binOffset++] = bNum & 0xff;
        }
        
        outputDisplay.value = displayParts.join(' ');

        const encryptedFileName = file.name + '_encrypted.bin';
        downloadFile(binBuffer, encryptedFileName, 'application/octet-stream');

    } else {
        const binBytes = new Uint8Array(arrayBuffer);

        const nameLen = (binBytes[0] << 8) | binBytes[1];
        const originalName = new TextDecoder().decode(binBytes.slice(2, 2 + nameLen));
        const dataBytes = binBytes.slice(2 + nameLen);

        if (dataBytes.length % 4 !== 0) {
            alert('Ошибка: неверный формат файла (размер данных не кратен 4 байтам)');
            return;
        }

        let inputParts = [];
        let decryptedBytes = [];

        for (let i = 0; i < dataBytes.length; i += 4) {
            const a = BigInt((dataBytes[i] << 8) | dataBytes[i + 1]);
            const b = BigInt((dataBytes[i + 2] << 8) | dataBytes[i + 3]);

            inputParts.push(`${Number(a)} ${Number(b)}`);

            const aInv = fastExp(a, p - 1n - x, p);
            const m = (b * aInv) % p;
            decryptedBytes.push(Number(m));
        }

        inputDisplay.value = inputParts.join(' ');
        
        const resultUint8 = new Uint8Array(decryptedBytes);
        outputDisplay.value = Array.from(resultUint8).join(' ');
        downloadFile(resultUint8, 'decrypted_' + originalName, 'application/octet-stream');
    }
}