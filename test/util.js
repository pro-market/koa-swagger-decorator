import { schemaToObject } from '../dist/utils';
import { expect } from 'chai';

describe('utils', () => {
  it('schemaToObject', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'boolean' },
        c: {
          type: 'object',
          properties: {
            a: {
              type: 'string'
            }
          }
        }
      }
    };

    const data = schemaToObject(schema);
    console.log(data);
    expect(data.c.a === { a: { type: 'string' } });
  });
});
