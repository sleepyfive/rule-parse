const parser = require("@babel/parser")

const code = `
    x!=null;//x列非空
    x>y;//x>y
    dumplicate(x)==false;//x列不能重复
    multi_sheet_dumplicate(x)==false;//该规则下的所有excel表的x列不能重复
    date_format(x)=='yyyy-mm-dd';//x列应为yyyy-mm-dd日期格式
    len(x)>100;// 字符串x的长度应该大于100
    ['a','b','c'].includes(x) == true;// x应该为a、b、c种的一个
    len(x+y) > 10;//x+y拼接后的字符串长度大于100
`

const option = {
}
const ast = parser.parse(code,option)

const gen = require('./code-gen').gen
const res = gen(ast.program.body,['x','y'])
console.log(JSON.stringify(res,null,4))
