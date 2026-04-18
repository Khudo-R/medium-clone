export async function catchErrorTyped<
  T,
  E extends new (...args: any[]) => Error,
>(
  promise: Promise<T>,
  errorsToCatch?: E[],
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error) => {
      if (errorsToCatch === undefined) {
        return [error];
      }

      if (errorsToCatch.some((e) => error instanceof e)) {
        return [error];
      }

      throw error;
    });
}
