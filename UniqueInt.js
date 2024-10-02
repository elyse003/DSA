const fs = require('fs');
const path = require('path');
const process = require('process');

// Function to check and create the input file if it doesn't exist
function ensureInputFileExists(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`The file '${filePath}' is missing. Generating a default file.`);
        const sampleData = '8\n12\n19\n25\n8\n12\n30';  // Example integers
        fs.writeFileSync(filePath, sampleData, 'utf-8');
        console.log(`Default data has been written to '${filePath}'.`);
    }
}

// Function to prepare the output directory
function prepareOutputDirectory() {
    const outputDir = path.join('results', 'data_files');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    return outputDir;
}

// Function to read integers from the input file
function readFileAndExtractNumbers(filePath) {
    let numbers = [];
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log(`Reading from file:\n${fileContent}`);

        // Parse and filter valid integers in a more concise manner
        numbers = fileContent.match(/-?\d+/g).map(Number);
    } catch (err) {
        console.error(`Unable to read the file: ${err.message}`);
    }
    return numbers;
}

// Function to remove duplicates and sort numbers
function getUniqueSortedNumbers(numbers) {
    const uniqueNums = new Set(numbers);  // Efficient duplicate removal with Set
    return Array.from(uniqueNums).sort((a, b) => a - b);  // Sorting numerically
}

// Function to write the unique, sorted numbers to the output file
function writeNumbersToFile(outputFilePath, numbers) {
    try {
        fs.writeFileSync(outputFilePath, numbers.join('\n'), 'utf-8');
        console.log(`Filtered numbers have been written to '${outputFilePath}'.`);
    } catch (err) {
        console.error(`Failed to write to the file: ${err.message}`);
    }
}

// Function to handle the file processing
function processFile(filePath) {
    // Ensure the input file exists
    ensureInputFileExists(filePath);

    // Prepare the output directory
    const outputDir = prepareOutputDirectory();
    const outputFilePath = path.join(outputDir, path.basename(filePath, path.extname(filePath)) + '_output.txt');

    // Read and process numbers from the file
    const numbers = readFileAndExtractNumbers(filePath);
    console.log(`Numbers before filtering: ${numbers.join(', ')}`);

    // Remove duplicates and sort
    const filteredNumbers = getUniqueSortedNumbers(numbers);
    console.log(`Unique and sorted numbers: ${filteredNumbers.join(', ')}`);

    // Write the results to the output file
    writeNumbersToFile(outputFilePath, filteredNumbers);
}

// Function to measure execution time and memory usage
function measurePerformance(func, ...params) {
    const start = process.hrtime();  // Start high-precision time tracking
    const initialMemory = process.memoryUsage().heapUsed;  // Capture starting memory

    func(...params);

    const duration = process.hrtime(start);  // End time tracking
    const finalMemory = process.memoryUsage().heapUsed;  // Capture final memory usage

    const timeTaken = duration[0] * 1e3 + duration[1] / 1e6;  // Convert time to milliseconds
    const memoryUsed = finalMemory - initialMemory;  // Calculate memory used

    return { timeTaken, memoryUsed };
}

// Example usage
const inputPath = path.resolve('input_data.txt');

// Measure performance (time and memory) of the processFile function
const performanceMetrics = measurePerformance(processFile, inputPath);

console.log(`Execution completed in: ${performanceMetrics.timeTaken.toFixed(3)} ms`);
console.log(`Memory consumption: ${performanceMetrics.memoryUsed} bytes`);