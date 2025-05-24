export const getFulfilledPromiseResults = <T>(result: PromiseSettledResult<T>[]): T[] => {
  return result.flatMap((item) => (item.status === 'fulfilled' && item.value ? [item.value] : []));
};

export const isPromiseAllSettledRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult => {
  return input.status === 'rejected';
};

export const isPromiseAllSettledFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => {
  return input.status === 'fulfilled';
};
