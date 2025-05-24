import { instanceToPlain } from 'class-transformer';

export const applyExclude = <T>(object: T): T => {
  return instanceToPlain(object) as T;
};
