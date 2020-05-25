import _path from 'path';
import globby from 'globby';
import is from 'is-type-of';
import { Dictionary } from 'ramda';

// eg. /api/{id} -> /api/:id
const convertPath = (path: string) => {
  const re = new RegExp('{(.*?)}', 'g');
  return path.replace(re, ':$1');
};

const getPath = (prefix: string, path: string) =>
  `${prefix}${path}`.replace('//', '/');

const reservedMethodNames = [
  'middlewares',
  'name',
  'constructor',
  'length',
  'prototype',
  'parameters',
  'prefix',
];

enum allowedMethods {
  GET= 'get',
  POST= 'post',
  PUT= 'put',
  PATCH= 'patch',
  DELETE= 'delete'
}

// 返回 filepath  的时候去掉扩展名然后去重
const getFilepaths = (dir: string, recursive: boolean = true, ignore: string[] = []) => {
  const ignoreDirs = ignore.map((path => `!${path}`));
  const paths = recursive
    ? globby.sync(['**/*.js', '**/*.ts', ...ignoreDirs], { cwd: dir })
    : globby.sync(['*.js', '*.ts', ...ignoreDirs], { cwd: dir });
  return paths.map(path => _path.join(dir, path));
};

const loadModule = (filepath: string) => {
  const obj = require(filepath);
  if (!obj) return obj;
  // it's es module
  if (obj.__esModule) return 'default' in obj ? obj.default : obj;
  return obj;
};

const loadClass = (filepath: string) => {
  const cls = loadModule(filepath);
  if (is.class(cls)) return cls;
  return false;
};

const loadSwaggerClasses = (dir: string = '', options: {recursive?: boolean; ignore?: string[]} = {}) => {
  dir = _path.resolve(dir);
  const { recursive = true } = options;
  return getFilepaths(dir, recursive, options.ignore)
    .map(filepath => loadClass(filepath))
    .filter(cls => cls);
};

const swaggerKeys = (className: String, methods: [String]) => methods.map(m => `${className}- ${m}`);

/**
 * Sorts an object (dictionary) by value returned by the valSelector function.
 * Note that order is only guaranteed for string keys.
 */
const sortObject = <TValue>(
  obj: Dictionary<TValue>,
  comparisonSelector: (val: TValue, length: number) => number | string,
  callbackFn?: (val: TValue) => TValue,
) => {
  const unsortedKeys = Object.keys(obj);
  const sortedKeys = unsortedKeys.sort((a, b) => (
    comparisonSelector(obj[a], unsortedKeys.length) > comparisonSelector(obj[b], unsortedKeys.length) ? 1 :
      comparisonSelector(obj[a], unsortedKeys.length) < comparisonSelector(obj[b], unsortedKeys.length) ? -1 : 0)
  );

  return sortedKeys.reduce((sorted: Dictionary<TValue>, k) => {
    let value = obj[k];
    if (callbackFn && is.function(callbackFn)) {
      value = callbackFn(value);
    }
    sorted[k] = value;
    return sorted;
  }, {});
};

export interface ISwaggerSchema {
  type: string;
  properties?: any;
  items?: any[];
}
// 将 swagger 的 schema 对象转换为 js 中的 object 递归的
export const schemaToObject = (schema: any) => {
  const {type, properties} = schema;

  if (type === 'object' && is.object(properties)) {
    const res: any  = {};
    Object.keys(properties).forEach(k => {
      res[k] = schemaToObject(properties[k]);
    });
    return res;
  }

  return schema;
};

class User {
  id: String;
  d: {
    yy: Boolean
  };
  x = {
    type: 'string'
  };
}
export const parameterTransformer = (object: any) => {
  // 判断使用的定义方式 可能需要的保留词 type 会有冲突
  const {type, properties} = schema;
  interface IX {
    a: String;
    d: {
      yy: Boolean,
    };
  }
  const y: User = {
    id: '34',
    d: {
      yy: true
    },
  };
  if (type === 'object' && is.object(properties)) {
    const res: any  = {};
    Object.keys(properties).forEach(k => {
      res[k] = parameterTransformer(properties[k]);
    });
    return res;
  }

  return schema;
};
export const objectToSchema = (object: any) => {
  return object;
};
export {
  convertPath,
  getPath,
  getFilepaths,
  loadClass,
  loadSwaggerClasses,
  reservedMethodNames,
  allowedMethods,
  swaggerKeys,
  sortObject,
};
