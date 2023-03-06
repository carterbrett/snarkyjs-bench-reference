import { runHashBench } from './lib.js';
import { shutdown } from 'snarkyjs';


// Run 1, 10, and 100 round hash chain benchmarks
await runHashBench(1);
await runHashBench(10);
await runHashBench(100);
shutdown();
