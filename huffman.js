import { BinaryHeap } from './heap.js';
export { HuffmanCoder }

class HuffmanCoder{
    
    display(node, modify, index=1) {
        // Pre-Order Tree Printing
        if(modify) {
            node = ['', node];
            if(node[1].length === 1) node[1] = node[1][0];
        }

        if(typeof(node[1]) === "string") return String(index) + " = " + node[1];

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, (index * 2) + 1);
        let res = String(index * 2) + " <= " + index + " => " + String((index * 2) + 1);
        return res + '\n' + left + '\n' + right;
    }

    stringify(node) {
        // Encoding Huffman Tree
        if(typeof(node[1]) === "string") return '\'' + node[1];
        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    destringify(data) {
        // Decoding Huffman Tree
        let node = [];
        if(data[this.ind] === '\'') {
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }
        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);
        return node;
    }

    getMappings(node, path) {
        // Get Character Mappings
        if(typeof(node[1]) === "string") {
            this.mappings[node[1]] = path;
            return;
        }
        this.getMappings(node[1][0], path + "0");
        this.getMappings(node[1][1], path + "1");
    }

    encode(data) {
        // Get Heap
        this.heap = new BinaryHeap();
        
        // Storing Frequency Count
        const mp = new Map();
        for(let i = 0; i < data.length; i++) {
            if(data[i] in mp) mp[data[i]] = mp[data[i]] + 1;
            else mp[data[i]] = 1;
        }

        // Insert Elements To Heap (-ve Because We Need Min Heap)
        for(const key in mp) {
            this.heap.insert([-mp[key], key]);
        }

        // Creating Huffman Tree
        while(this.heap.size() > 1) {
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();
            
            const node = [node1[0] + node2[0], [node1, node2]];
            this.heap.insert(node);
        }

        // Extracting Huffman Tree
        const huffman_encoder = this.heap.extractMax();

        // Get Character To Binary String Mappings
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        // Mapping Character String To Binary String
        let binary_string = "";
        for(let i = 0; i < data.length; i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }

        // Padding Binary String To Make Length Multiple 0f 8.
        let rem = (8 - (binary_string.length % 8)) % 8;
        let padding = "";
        for(let i = 0; i < rem; i++) padding = padding + "0";
        binary_string = binary_string + padding;

        // Binary String To Corresponding Character Array
        let result = "";
        for(let i = 0; i < binary_string.length; i+=8) {
            let num = 0;
            for(let j = 0; j < 8; j++){
                num = (num * 2) + (binary_string[i+j] - "0");
            }
            result = result + String.fromCharCode(num);
        }

        // Concatenating Required Info To Decode Tree
        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + (data.length/final_res.length);
        info = "Compression Complete And File Sent For Download " + '\n' + info;

        // Returning Encoded Data, Tree Structure And Extra Info.
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data) {
        // Splitting String Into Huffman Tree, Padding, Encoded Text
        data = data.split('\n');
        if(data.length === 4) {
            // Handling New Line In Huffman Tree
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        this.ind = 0;
        // Decoding Huffman Tree
        const huffman_decoder = this.destringify(data[0]);
        const text = data[2];

        // Encoded Text To Binary String
        let binary_string = "";
        for(let i = 0; i < text.length; i++) {
            let num = text[i].charCodeAt(0);
            let bin = "";
            for(let j = 0; j < 8; j++) {
                bin = (num % 2) + bin;
                num = Math.floor(num / 2);
            }
            binary_string = binary_string + bin;
        }

        // Removing Padding
        binary_string = binary_string.substring(0, (binary_string.length - data[1]));

        // Binary String To Original Text Using Huffman Tree
        let res = "";
        let node = huffman_decoder;
        for(let i = 0; i < binary_string.length; i++) {
            if(binary_string[i] === '0') {
                node = node[0];
            } else {
                node = node[1];
            }
            if(typeof(node[0]) === "string") {
                res += node[0];
                node = huffman_decoder;
            }
        }

        let info = "Decompression Complete And File Sent For Download.";
        // Returning Decoded Text, Tree Structure And Extra Info.
        return [res, this.display(huffman_decoder, true), info];
    }
}
