/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
export declare function startHeartbeat(): void;
export declare function stopHeartbeat(): void;
/**
 * Returns the last heartbeat stored in extension storage, or undefined if
 * the heartbeat has never run before.
 */
export declare function getLastHeartbeat(): Promise<number | undefined>;
