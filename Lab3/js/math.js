function fastExp(a, z, n) {
    let res = BigInt(1);
    a = BigInt(a) % BigInt(n);
    z = BigInt(z);
    let mod = BigInt(n);
    while (z > 0n) {
        if (z % 2n === 1n) res = (res * a) % mod;
        a = (a * a) % mod;
        z = z / 2n;
    }
    return res;
}

function gcd(a, b) {
    a = BigInt(a); b = BigInt(b);
    while (b !== 0n) {
        a %= b;
        [a, b] = [b, a];
    }
    return a;
}

function getPrimeFactors(n) {
    let factors = new Set();
    let d = 2n;
    let temp = BigInt(n);
    while (d * d <= temp) {
        while (temp % d === 0n) {
            factors.add(d);
            temp /= d;
        }
        d++;
    }
    if (temp > 1n) factors.add(temp);
    return Array.from(factors);
}

function isPrime(n) {
    n = BigInt(n);
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;

    const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    let d = n - 1n, r = 0n;
    while (d % 2n === 0n) { d /= 2n; r++; }

    outer: for (const a of witnesses) {
        if (a >= n) continue;
        let x = fastExp(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        for (let i = 0n; i < r - 1n; i++) {
            x = x * x % n;
            if (x === n - 1n) continue outer;
        }
        return false;
    }
    return true;
}