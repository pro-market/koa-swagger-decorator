import init from './swaggerTemplate';
import { getPath, sortObject } from './utils';
import { Dictionary, clone } from 'ramda';
/**
 * build swagger json from apiObjects
 */
const swaggerJSON = (options: { [name: string]: any } = {}, apiObjects: any) => {
  const {
    title,
    description,
    version,
    prefix = '',
    swaggerOptions = {}
  } = options;
  const swaggerJSON: any = init(title, description, version, swaggerOptions);
  const paths: Dictionary<{ [method: string]: any }> = {};
  Object.keys(apiObjects).forEach((key) => {
    const value = apiObjects[key];
    if (!Object.keys(value).includes('request')) {
      return;
    }

    const { method } = value.request;
    let { path } = value.request;
    path = getPath(prefix, value.prefix ? `${value.prefix}${path}` : path); // 根据前缀补全path
    const summary = value.summary || '';
    const description = value.description || summary;
    const responses = value.responses || {
      200: { description: 'success' }
    };
    const {
      query = [],
      header = [],
      path: pathParams = [],
      order,
      tags,
      security,
      deprecated,
      requestBody,
    } = value;

    pathParams.forEach((o: any) => o.required = true); // path params should not be optional
    const parameters = [...pathParams, ...query, ...header];
    parameters.forEach((o: any) => o.schema = o.type && !o.schema ? clone(o) : o.schema); // compatiable for swagger v2

    // init path object first
    if (!paths[path]) {
      paths[path] = {};
    }

    paths[path][method] = {
      summary,
      description,
      parameters,
      responses,
      tags,
      security,
      deprecated,
      requestBody,
    };
    if (!paths[path]._order) {
      paths[path]._order = order;
    }
  });
  swaggerJSON.paths = sortObject(paths, (path, length) => path._order || length, (path) => {
    const { _order, ...restOfPathData } = path;
    return restOfPathData;
  });
  return swaggerJSON;
};

export default swaggerJSON;
export { swaggerJSON };
