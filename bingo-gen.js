// Seeded Random Number Generator (Linear Congruential Generator)
class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
    
    // Generate random integer between min and max (inclusive)
    randint(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    
    // Shuffle array in place using Fisher-Yates
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Sample n elements from range without replacement
    sampleRange(min, max, count) {
        const array = Array.from({length: max - min + 1}, (_, i) => i + min);
        this.shuffle(array);
        return array.slice(0, count);
    }
}


// BingoCard class
class BingoCard {
    constructor(seed = null) {
        if (seed === null || seed === 'random' || seed === '') {
            // Generate random 24-bit number like Python getrandbits(24)
            this.seed = Math.floor(Math.random() * 16777216); // 2^24
        } else {
            this.seed = parseInt(seed);
        }
        this.rng = new SeededRandom(this.seed);
        
        // Generate card data
        const B = this.rng.sampleRange(1, 15, 5);
        const I = this.rng.sampleRange(16, 30, 5);
        const N = this.rng.sampleRange(31, 45, 5);
        const G = this.rng.sampleRange(46, 60, 5);
        const O = this.rng.sampleRange(61, 75, 5);
        
        // Set center as X
        N[2] = 'X';
        
        this.data = [B, I, N, G, O];
        this.calledNumbers = null;
    }
    
    header1() {
        const seedStr = this.seed.toString();
        const padding = 16 - seedStr.length - 4; // 4 for "[ ]"
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ".-" + "-".repeat(leftPad) + "[ " + seedStr + " ]" + "-".repeat(rightPad) + "--.";
    }
    
    header2() {
        return "| B | I | N | G | O |";
    }
    
    header3() {
        return "|---+---+---+---+---|";
    }
    
    space() {
        return "|---+---+---+---+---|";
    }
    
    footer() {
        return "`-------------------'";
    }
    
    row(rownum) {
        let result = "|";
        for (let i = 0; i < 5; i++) {
            let value = this.data[i][rownum];
            let cellContent;
            
            if (this.calledNumbers && 
                ((this.calledNumbers.includes(value)) || (rownum === 2 && i === 2))) {
                if (value === 'X') {
                    cellContent = '<span style="background-color: white; color: black;">XXX</span>';
                } else {
                    cellContent = '<span style="background-color: white; color: black;">' + String(value).padStart(3, ' ') + '</span>';
                }
            } else {
                if (value === 'X') {
                    cellContent = ' X ';
                } else {
                    cellContent = String(value).padStart(3, ' ');
                }
            }
            result += cellContent + "|";
        }
        return result;
    }
    
    toString() {
        return this.header1() + '\n' +
               this.header2() + '\n' +
               this.header3() + '\n' +
               this.row(0) + '\n' +
               this.space() + '\n' +
               this.row(1) + '\n' +
               this.space() + '\n' +
               this.row(2) + '\n' +
               this.space() + '\n' +
               this.row(3) + '\n' +
               this.space() + '\n' +
               this.row(4) + '\n' +
               this.footer() + '\n';
    }
    
    checkWin(callList, numbersCalled) {
        this.calledNumbers = callList.data.slice(0, numbersCalled);
        const winType = this.getWinType();
        const cardDisplay = this.toString();
        
        if (winType) {
            return cardDisplay + '\n*** WINNER! ' + winType + ' after ' + numbersCalled + ' numbers ***\n';
        } else {
            return cardDisplay + '\nNot a winner yet after ' + numbersCalled + ' numbers.\n';
        }
    }
    
    getWinType() {
        if (!this.calledNumbers) return null;
        
        // Check rows
        for (let row = 0; row < 5; row++) {
            let rowWin = true;
            for (let col = 0; col < 5; col++) {
                const value = this.data[col][row];
                // Center is always considered called (it's X)
                if (row === 2 && col === 2) continue;
                if (!this.calledNumbers.includes(value)) {
                    rowWin = false;
                    break;
                }
            }
            if (rowWin) return 'Row ' + (row + 1);
        }
        
        // Check columns
        const colNames = ['B', 'I', 'N', 'G', 'O'];
        for (let col = 0; col < 5; col++) {
            let colWin = true;
            for (let row = 0; row < 5; row++) {
                const value = this.data[col][row];
                // Center is always considered called (it's X)
                if (row === 2 && col === 2) continue;
                if (!this.calledNumbers.includes(value)) {
                    colWin = false;
                    break;
                }
            }
            if (colWin) return 'Column ' + colNames[col];
        }
        
        // Check diagonal (top-left to bottom-right)
        let diag1Win = true;
        for (let i = 0; i < 5; i++) {
            const value = this.data[i][i];
            // Center is always considered called (it's X)
            if (i === 2) continue;
            if (!this.calledNumbers.includes(value)) {
                diag1Win = false;
                break;
            }
        }
        if (diag1Win) return 'Diagonal';
        
        // Check diagonal (top-right to bottom-left)
        let diag2Win = true;
        for (let i = 0; i < 5; i++) {
            const value = this.data[4-i][i];
            // Center is always considered called (it's X)
            if (i === 2) continue;
            if (!this.calledNumbers.includes(value)) {
                diag2Win = false;
                break;
            }
        }
        if (diag2Win) return 'Diagonal';
        
        return null;
    }
}

// CallList class
class CallList {
    constructor(seed = null, numbersCalled = 75) {
        if (seed === null || seed === 'random' || seed === '') {
            // Generate random 24-bit number like Python getrandbits(24)
            this.seed = Math.floor(Math.random() * 16777216); // 2^24
        } else {
            this.seed = parseInt(seed);
        }
        this.rng = new SeededRandom(this.seed);
        this.numbersCalled = numbersCalled;
        
        // Generate shuffled sequence 1-75
        this.data = Array.from({length: 75}, (_, i) => i + 1);
        this.rng.shuffle(this.data);
    }
    
    toString(numbersCalled = null) {
        const callsToShow = numbersCalled || this.numbersCalled;
        const isPartial = callsToShow < 75;
        const title = isPartial ? "Numbers Called" : "Bingo Call List";
        let result = title + " [ " + this.seed + " ] \n";
        
        for (let i = 0; i < callsToShow; i++) {
            const number = this.data[i];
            result += " Number " + String(i + 1).padStart(2, ' ') + ": ";
            
            // Add B-I-N-G-O prefix
            if (number < 16) result += "B";
            else if (number < 31) result += "I";
            else if (number < 46) result += "N";
            else if (number < 61) result += "G";
            else result += "O";
            
            result += "-" + String(number).padStart(2, ' ');
            
            result += "\n";
        }
        return result;
    }
}

// Utility functions
function generateCardSheet(columns, rows) {
    let sheet = '';
    for (let r = 0; r < rows; r++) {
        sheet += 'scribe\n\n';
        const cards = [];
        
        // Generate cards for this row
        for (let c = 0; c < columns; c++) {
            cards.push(new BingoCard());
        }
        
        // Output headers
        for (let c = 0; c < columns; c++) {
            sheet += cards[c].header1() + '   ';
        }
        sheet += '\n';
        
        for (let c = 0; c < columns; c++) {
            sheet += cards[c].header2() + '   ';
        }
        sheet += '\n';
        
        for (let c = 0; c < columns; c++) {
            sheet += cards[c].header3() + '   ';
        }
        sheet += '\n';
        
        // Output card rows
        for (let cardRow = 0; cardRow < 5; cardRow++) {
            for (let c = 0; c < columns; c++) {
                sheet += cards[c].row(cardRow) + '   ';
            }
            sheet += '\n';
            
            if (cardRow < 4) {
                for (let c = 0; c < columns; c++) {
                    sheet += cards[c].space() + '   ';
                }
                sheet += '\n';
            }
        }
        
        // Output footers
        for (let c = 0; c < columns; c++) {
            sheet += cards[c].footer() + '   ';
        }
        sheet += '\n\n.\n';
    }
    return sheet;
}

// Event handlers
function handleCardSheet(event) {
    event.preventDefault();
    const form = event.target;
    const x = parseInt(form.x.value);
    const y = parseInt(form.y.value);
    
    const sheet = generateCardSheet(y, x); // Note: x=rows, y=columns in Django
    showResults(`Card Sheet (${x}x${y})`, sheet);
}

function generateCallList(event) {
    event.preventDefault();
    const form = event.target;
    const seed = form.call_list_id.value;
    
    const callList = new CallList(seed);
    showResults(`Call List #${callList.seed}`, callList.toString());
}

function generateSingleCard(event) {
    event.preventDefault();
    const form = event.target;
    const seed = form.card_id.value;
    
    const card = new BingoCard(seed);
    showResults(`Bingo Card #${card.seed}`, card.toString());
}

function checkWinner(event) {
    event.preventDefault();
    const form = event.target;
    const cardSeed = form.card_id.value;
    const callListSeed = form.call_list_id.value;
    const numbersCalled = parseInt(form.numbers_called.value);
    
    const card = new BingoCard(cardSeed);
    const callList = new CallList(callListSeed, numbersCalled);
    
    const result = card.checkWin(callList, numbersCalled);
    const callListStr = callList.toString();
    
    showResults(`Check Winner #${card.seed}`, result + '\n<br>\n' + callListStr);
}

function showResults(title, content) {
    document.title = `Bingo Generator | ${title}`;
    const resultsDiv = document.getElementById('results');
    const resultsTitle = document.getElementById('results-title');
    const resultsContent = document.getElementById('results-content');
    
    resultsTitle.textContent = title;
    resultsContent.innerHTML = '<pre>' + content + '</pre>';
    resultsDiv.classList.remove('hidden');
}

function copyResults() {
    const resultsContent = document.getElementById('results-content');
    const pre = resultsContent.querySelector('pre');
    if (pre) {
        // Create a temporary textarea to copy the text content (without HTML)
        const textArea = document.createElement('textarea');
        textArea.value = pre.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            
            // Show feedback
            const copyButton = document.querySelector('.copy-button');
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            copyButton.style.background = '#10b981';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.background = '#374151';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textArea);
    }
}