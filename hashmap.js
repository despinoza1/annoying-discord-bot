class HashMap {
    constructor() {
        this._storage = [];
    }
    
    set(key, val) {
        let idx = this.hash(key);

        if (!this._storage[idx])
            this._storage[idx] = []
        
        if (!this.has(key))
            this._storage[idx].push([key, val]);
        else {
            for (let i = 0; i < this._storage[idx].length; i++) {
                if (this._storage[idx][i][0] == key) {
                    this._storage[idx][i][1] = val;
                    break;
                }
            }
        }
    }
    
    get(key) {
        let idx = this.hash(key);

        for (let i = 0; i < this._storage[idx].length; i++) {
            if (this._storage[idx][i][0] == key)
                return this._storage[idx][i][1]
        }
    }

    inc(key) {
        let idx = this.hash(key);

        for (let i = 0; i < this._storage[idx].length; i++) {
            if (this._storage[idx][i][0] == key) {
                this._storage[idx][i][1] = this._storage[idx][i][1]+1
                return
            }
        }
    }

    has(key) {
        let idx = this.hash(key);

        if (this._storage.length == 0 || typeof this._storage[idx] === 'undefined')
            return false
        
        for (let i = 0; i < this._storage[idx].length; i++) {
            if (this._storage[idx][i][0] == key)
                return true
        }

        return false
    }
    
    hash(str) {
        let h = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            h += char
        }
        
        return h
    }
}

module.exports = HashMap;