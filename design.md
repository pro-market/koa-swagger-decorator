## 设计文档

#### supported types
- String
- Number
- Object
- Array
- Boolean

#### swagger object 转 plain object
允许用户用 js 的对象更加方便的写 swagger 文档
对于需要更具体的 swagger 描述的，也可以直接使用 swagger 规范的定义
```javascript

using eg.
// parameter transformer
// response transformer
// schema transformer/parser
// TODO 单向 transformer or 
@body({
  a: String,
  b: Object,
  c: {
    xx: String,
  },
  d: {
    yy: Boolean,
    zz: Array,
  }
})
// swagger
const schema = {
  type: 'object',
  properties: {
    a: {type: 'string'},
    b: {
      type: 'object',
      properties: {
        a: {
          type: 'string'
        }
      }
    }
  }
}

const s = {type: 'string'}
const eq = {
  a: {type:String},
  b: {
    a: String
  }
}
```