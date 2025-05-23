export const describeFunction = (fn: Function, description: string) => {
  Object.assign(fn, {
    description,
  });
};

export const getFunctionDescription = (fn: Function) => {
  if ('description' in fn && typeof fn.description === 'string') {
    return fn.description;
  }
};
