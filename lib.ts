import { Poseidon, Field, isReady, Experimental, shutdown } from 'snarkyjs';
import { HashBench } from './types';

await isReady;

export const hashBenchCreator = (rounds: number) => {
  let bench: HashBench = {
    type: 'Iterative hashing',
    frontend: 'SnarkyJS',
    rounds: rounds,
    compile: {
      time_in_ms: 0,
      memory_in_mb: 0,
    },
    prove: {
      time_in_ms: 0,
      memory_in_mb: 0,
    },
    verify: {
      time_in_ms: 0,
      memory_in_mb: 0,
    },
  };

  return bench;
}

export const genFieldFromBytes = (byteLength: number) => {
  const byteArray = new Uint8Array(byteLength); // creates a new 32 byte array
  byteArray.fill(0); // sets all elements to 0
  const fieldFromBytes = Field.fromBytes(byteArray as any);
  return Promise.resolve(fieldFromBytes);
}

export const targetDigest = async (rounds: number): Promise<Field> => {
  const fieldFromBytes = await genFieldFromBytes(32);
  let targetDigest: Field = Poseidon.hash([fieldFromBytes]);

  for (let i = 1; i < rounds; i++) {
    targetDigest = Poseidon.hash([targetDigest]);
  }

  return Promise.resolve(targetDigest)
}

export const hashBench = async (targetDigest: Field, preimage: Field, rounds: number): Promise<HashBench> => { 
  let bench = hashBenchCreator(rounds);
  
  const benchProgram = Experimental.ZkProgram({
    publicInput: Field,
    methods: {
      run: {
        privateInputs: [Field],
        method(preimage: Field, targetDigest: Field) {

          let digest = Poseidon.hash([preimage]); // 1
          for (let i = 0; i < rounds - 1; i++) {
            digest = Poseidon.hash([digest]);
          }

          digest.assertEquals(targetDigest);
        },
      },
    },
  });

  // Track compile time
  console.log(`${bench.type} ROUNDS=${rounds}: starting...`);
  const t0 = performance.now();
  await benchProgram.compile();
  const t1 = performance.now();
  bench.compile.time_in_ms = t1 - t0;
  bench.compile.memory_in_mb = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`${bench.compile.time_in_ms} ms COMPILE time`);

  // Track proving time
  const t2 = performance.now();
  let proof = await benchProgram.run(preimage, targetDigest);
  const t3 = performance.now();
  bench.prove.time_in_ms = t3 - t2;
  bench.prove.memory_in_mb = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`${bench.prove.time_in_ms} ms PROVING time`);

  // Track verification time
  const t4 = performance.now();
  await benchProgram.verify(proof);
  const t5 = performance.now();
  bench.verify.time_in_ms = t5 - t4;
  bench.verify.memory_in_mb = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`${bench.verify.time_in_ms} ms VERIFICATION time`);
  
  return Promise.resolve(bench);
};

export const runHashBench = async (rounds: number): Promise<HashBench> => {
  let benchObj = hashBenchCreator(rounds);
  const preimage: Field = await genFieldFromBytes(32);
  const _targetDigest: Field = await targetDigest(benchObj.rounds);
  const bench = await hashBench(_targetDigest, preimage, benchObj.rounds);

  return Promise.resolve(bench);
}
