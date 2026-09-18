/**
 * Browser shim for node util module required by @tensorflow-models/speech-commands
 */
export function promisify<T = unknown>(fn: (...args: unknown[]) => void) {
  return function (...args: unknown[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      fn(...args, (err: unknown, res: T) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };
}

export default {
  promisify,
};
