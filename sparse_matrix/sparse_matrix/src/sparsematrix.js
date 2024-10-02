const fs = require('fs');
const readline = require('readline');

class SparseMatrix {
    constructor() {
        this.data = new Map(); // Store non-zero matrix values
        this.rowCount = 0;
        this.colCount = 0;
    }

    // Loads a matrix from a file by reading its non-zero elements
    loadMatrix(filePath) {
        try {
            console.log(`Loading matrix from: ${filePath}`);
            const matrixContent = fs.readFileSync(filePath, 'utf-8');
            const [rowsLine, colsLine, ...entries] = matrixContent.split('\n').filter(Boolean);

            this.rowCount = parseInt(rowsLine.split('=')[1]);
            this.colCount = parseInt(colsLine.split('=')[1]);
            console.log(`Matrix size: ${this.rowCount}x${this.colCount}`);

            entries.forEach(entry => {
                const [row, col, value] = entry.replace(/[()]/g, '').split(',').map(Number);
                if (value !== 0) this.data.set(`${row},${col}`, value);
            });
        } catch (error) {
            console.error(`Error loading matrix from file: ${error.message}`);
        }
    }

    // Saves a matrix to a file in a readable format
    saveMatrix(filePath) {
        const output = [`Rows=${this.rowCount}`, `Cols=${this.colCount}`];
        this.data.forEach((value, key) => output.push(`(${key},${value})`));
        fs.writeFileSync(filePath, output.join('\n'), 'utf-8');
        console.log(`Matrix saved to ${filePath}`);
    }

    // Check if matrices can be added or subtracted based on size
    validateForAddSub(matrix) {
        if (this.rowCount !== matrix.rowCount || this.colCount !== matrix.colCount) {
            throw new Error("Matrices must have the same dimensions for addition or subtraction.");
        }
    }

    // Check if matrices can be multiplied based on size
    validateForMultiply(matrix) {
        if (this.colCount !== matrix.rowCount) {
            throw new Error("For multiplication, the number of columns of the first matrix must equal the number of rows of the second.");
        }
    }

    // Perform matrix addition
    addMatrix(matrix) {
        this.validateForAddSub(matrix);
        const result = new SparseMatrix();
        result.rowCount = this.rowCount;
        result.colCount = this.colCount;

        const combine = (val1, val2) => (val1 || 0) + (val2 || 0);

        this.data.forEach((value, key) => result.data.set(key, value));
        matrix.data.forEach((value, key) => result.data.set(key, combine(result.data.get(key), value)));

        return result;
    }

    // Perform matrix subtraction
    subtractMatrix(matrix) {
        this.validateForAddSub(matrix);
        const result = new SparseMatrix();
        result.rowCount = this.rowCount;
        result.colCount = this.colCount;

        const combine = (val1, val2) => (val1 || 0) - (val2 || 0);

        this.data.forEach((value, key) => result.data.set(key, value));
        matrix.data.forEach((value, key) => result.data.set(key, combine(result.data.get(key), value)));

        return result;
    }

    // Perform matrix multiplication
    multiplyMatrix(matrix) {
        this.validateForMultiply(matrix);
        const result = new SparseMatrix();
        result.rowCount = this.rowCount;
        result.colCount = matrix.colCount;

        this.data.forEach((value1, key1) => {
            const [i, k] = key1.split(',').map(Number);
            matrix.data.forEach((value2, key2) => {
                const [k2, j] = key2.split(',').map(Number);
                if (k === k2) {
                    const resultKey = `${i},${j}`;
                    const product = value1 * value2;
                    result.data.set(resultKey, (result.data.get(resultKey) || 0) + product);
                }
            });
        });

        return result;
    }
}

// Readline interface for user interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to get file paths from user input
function promptForFilePaths(callback) {
    rl.question('Enter the file path for the first matrix: ', (file1) => {
        rl.question('Enter the file path for the second matrix: ', (file2) => {
            callback(file1, file2);
        });
    });
}

// Function to perform matrix operations based on user selection
function performOperation(operation) {
    promptForFilePaths((file1, file2) => {
        const matrix1 = new SparseMatrix();
        const matrix2 = new SparseMatrix();

        try {
            matrix1.loadMatrix(file1);
            matrix2.loadMatrix(file2);

            let result;
            switch (operation) {
                case 'add':
                    result = matrix1.addMatrix(matrix2);
                    break;
                case 'subtract':
                    result = matrix1.subtractMatrix(matrix2);
                    break;
                case 'multiply':
                    result = matrix1.multiplyMatrix(matrix2);
                    break;
                default:
                    console.log('Invalid operation.');
                    return;
            }

            result.saveMatrix('result_matrix.txt');
            console.log(`Operation completed and result saved in result_matrix.txt`);
        } catch (error) {
            console.error(`Error performing operation: ${error.message}`);
        } finally {
            showMenu();
        }
    });
}

// Display menu options for matrix operations
function showMenu() {
    console.log('Choose an operation:');
    console.log('1. Add two matrices');
    console.log('2. Subtract two matrices');
    console.log('3. Multiply two matrices');
    console.log('4. Exit');
    rl.question('Enter your choice: ', (choice) => {
        switch (choice.trim()) {
            case '1':
                performOperation('add');
                break;
            case '2':
                performOperation('subtract');
                break;
            case '3':
                performOperation('multiply');
                break;
            case '4':
                rl.close();
                break;
            default:
                console.log('Invalid choice. Please select again.');
                showMenu();
                break;
        }
    });
}

// Start by showing the menu
showMenu();
