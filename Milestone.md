## Milestone

- remove all js files
- using monorepo ?
- type safe support
- remove useless features & refactor code
- Using joi/paramters for validation
- convert swagger object/array structs to plain javascript objects
- Add design doc
- seperate router & swagger definitions
  - **can be used with normal koa-router**
    - which means does not modify koa-router instance
      - **TODO**: middlewares support should be disabled
      - eg.

      ```javascript
      router.get('/api', authMiddlware, controller);

      @request('GET', '/api')
      async controller() {
        ...
      }
      ```


Exists Problems
- Class name can not be duplicated
- Function decorators should prior to Class decorators
- Babel support for decorators revolve
- Doc typo