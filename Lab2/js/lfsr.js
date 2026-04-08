class LFSR {
    constructor(seed) {
        this.state = [...seed]; 
    }

    nextBit() {
        const newBit = this.state[0] ^ this.state[14] ^ this.state[15] ^ this.state[29];
        const output = this.state.shift(); 

        this.state.push(newBit);

        return output;
    }
}