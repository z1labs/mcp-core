import type { ChatCompletionTool } from 'openai/resources';

export type ActionFunction = (...args: any[]) => Promise<any> | any;

export interface IToolProperty {
  type: string;
  description: string;
  enum?: string[];
}

export interface IToolParameters {
  type: string;
  properties: Record<string, IToolProperty>;
  required?: string[];
}

export interface IToolFunction {
  name: string;
  description: string;
  parameters: IToolParameters;
}

export interface ITool {
  type: string;
  function: IToolFunction;
}

export interface IAction {
  toolSchema: ChatCompletionTool;
  func: ActionFunction;
}

export type VectorOrString = Array<number> | string;

export interface IVectorStoreRecord {
  id: string;
  payload: Record<string, any>;
  vector: Array<number>;
  similarity?: number;
}

export interface IVectorPayload {
  content?: string;
  [key: string]: any;
}

export interface IVectorStoreSearchParams {
  vectorOrString: VectorOrString;
  maxSimilarity?: number;
  limit?: number;
  additionalParams?: Record<string, any>;
}

export interface IVectorStoreDeleteData {
  id: string;
}
