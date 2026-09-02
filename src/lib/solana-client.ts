import { Connection } from '@solana/web3.js';
import { TtlCache } from './cache.js';

const connections = new Map<string, Connection>();

/**
 * Return a singleton {@link Connection} for the given RPC URL, creating it on
 * first use. Reusing the connection avoids per-call socket setup.
 *
 * @param rpcUrl Solana JSON-RPC endpoint.
 */
export function getConnection(rpcUrl: string): Connection {
  let connection = connections.get(rpcUrl);
  if (!connection) {
    connection = new Connection(rpcUrl, 'confirmed');
    connections.set(rpcUrl, connection);
  }
  return connection;
}

/** Shared 5-second cache for chain-state RPC reads. */
export const chainCache = new TtlCache(5_000);

/**
 * Race a promise against a timeout so a hung or unreachable RPC endpoint fails
 * fast with a clear message instead of leaving the tool call pending forever.
 *
 * @param promise The RPC operation.
 * @param ms Timeout in milliseconds (default 10s).
 * @param label Human-readable operation name for the error message.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 10_000,
  label = 'RPC request',
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
