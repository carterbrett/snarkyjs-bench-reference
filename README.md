## SnarkyJS hashing bench reference
This is a reference implementation of a hashing benchmark in the style of Delendum's [ZK System Benchmarking](https://github.com/delendum-xyz/zk-benchmarking) where a SnarkyJS circuit proves the preimage of a 32 byte array, after `N` rounds of iterative hashing (i.e. hash chain of length `N`). 

### Prerequisites
TypeScript
Node.js

### Instructions
Install dependencies with `npm i`. 
Run with the `npm run bench` command. 

You can use the `runHashBench` exported by `lib.ts` programattically. You pass it the desired length of your hash chain and as a parameter (ex. `runHashBench(100)`) and it returns a promise which resolves a JSON object with the full bench results. 

### Implementation notes
**Hash function**
Unlike the Delendum benchmark which features Sha2 and other hash functions, only [Mina's Poseidon hash function](https://o1-labs.github.io/proof-systems/specs/poseidon.html) is used here. 

**Measurements**
This bench measures compile, proving, and verification times as well as max memory usage. Note that max memory is naively implemented with Node.js's `process.memoryUsage` API and returns inconsistent results because of Node's garbage collection. 

### Usage
You can see an example of the bench running three times with 1, 10, and 100 rounds of hashing respectively. The time results will print in the console as they're measured. Memory usage and times are returned as a JSON object by the `runHashBench` if used programatically. 

## Observations
**Compile Time**
Compile time is cut down significantly (~75%) after `.compile` is called a second time. Though the bench starts measuring time AFTER `isReady` is done running (function to await loading of SnarkyJS), perhaps this is due to lazy loading of SnarkyJS into memory or something like that. 

**Uncorrelated hash chain length and proving time**
The proving time is roughly the same for a hash chain of length `1` and length `10`. Even after proving a hash chain of length `100` the proving time only increases ~10-15%. This seems to demonstrate that the vast majority of work being done by the prove function in this circuits, is required repetitive work, uncorrelated to the length of the circuit. 

**WASM runtime memory limits**
Today SnarkyJS does not support arbitratory memory limits in WASM (experimental feature) or native execution, so 4gb max memory is available. 

## Results
Since memory results are inconsistent (mentioned in "Measurements" section above), I'll just share the results timed results on my Quad-core Intel i7 MBP with 16gb of memory:

>Iterative hashing ROUNDS=1: starting... </br>
24140.265507996082 ms COMPILE time</br>
16339.569884955883 ms PROVING time</br>
1384.3547530174255 ms VERIFICATION time</br>
Iterative hashing ROUNDS=10: starting...</br>
7168.892490983009 ms COMPILE time</br>
16906.671908974648 ms PROVING time</br>
1507.1954950094223 ms VERIFICATION time</br>
Iterative hashing ROUNDS=100: starting...</br>
9599.248153030872 ms COMPILE time</br>
18786.807682991028 ms PROVING time</br>
1505.5424020290375 ms VERIFICATION time</br>