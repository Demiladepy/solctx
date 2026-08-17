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
