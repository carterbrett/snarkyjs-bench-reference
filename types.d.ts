export interface HashBench {
  type: string;
  frontend: string;
  rounds: number;
  compile: {
    time_in_ms: number;
    memory_in_mb: number;
  }
  prove: {
    time_in_ms: number;
    memory_in_mb: number;
  },
  verify: {
    time_in_ms: number;
    memory_in_mb: number;
  }
};