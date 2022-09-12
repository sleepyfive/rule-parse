const gen = (ast_arr,col_arr) => {
    const rules = []
    const warnings = []
    for(const ast of ast_arr) {
        const res = dispatcher(ast,col_arr)
        if(res.error) {
            return {
                error: res.error
            }
        }
        rules.push(res)
    }

    return {
        rules,
        warnings,
    }
}

const Identifier = 'Identifier'
const BinaryExpression = 'BinaryExpression'
const NullLiteral = 'NullLiteral'
const StringLiteral = 'StringLiteral'
const CallExpression = 'CallExpression'

const format_name = (name) => {
    const newName = name.replace(/([A-Z])/g,'_$1').toLowerCase().substring(1)
    return newName
}

const get_rule = (fn_name) => {
    return fn_name
}

const dispatcher = (ast,col_arr) => {
    const type = format_name(ast.type)
    const handler_name = `${type}_handler`
    if(Reflect.has(handlers,handler_name)) {
        return handlers[handler_name].call(null,ast,col_arr)
    } else {
       return other_handler(ast,col_arr)
    }
}


const expression_statement_handler = (ast,col_arr) => {
    const { expression } = ast
    const { type, left, right, operator } = expression
    if(type === BinaryExpression) {
        if(left.type === Identifier) {
            /*
                x != null
                x>y
            */
            const { name } =left
            if(col_arr.includes(name)===false) {
                return {
                    error: ``
                }
            }
            switch (right.type) {
                case Identifier:
                    if(col_arr.includes(right.name)===false) {
                        return {
                            error: ``
                        }
                    }
                    return {
                            col: name,
                            rule: '列间比较',
                            operator,
                            value: right.name,
                    }

                case NullLiteral:
                    return {
                            col: name,
                            rule: '值比较',
                            operator,
                            value: null,
                    }
                case StringLiteral:
                    return {
                            col: name,
                            rule: '值比较',
                            operator,
                            value: right.value,
                    }
            }
        } else if (left.type === CallExpression) {
            /*
                dumplicate(x)==false//x列不能重复
                multi_sheet_dumplicate(x)==false//该规则下的所有excel表的x列不能重复
                date_format(x)=='yyyy-mm-dd'//x列应为yyyy-mm-dd日期格式
                len(x)>100// 字符串x的长度应该大于100
                ['a','b','c'].includes(x) == true// x应该为a、b、c种的一个
                len(x+y) > 10 //x+y拼接后的字符串长度大于100
            */
            const { callee, arguments } = left
            let rule=''
            let enums = []
            switch (callee.type) {
                case Identifier:
                    rule = callee.name
                    break
                case 'MemberExpression':
                    rule = callee.property.name
                    const { object:obj } = callee
                    if(obj.type!=='ArrayExpression') {
                        return {
                            error: ''
                        }
                    }
                    for(let member of obj.elements) {
                        if(member.type!==StringLiteral) {
                            return {
                                error: ''
                            }
                        }
                        enums.push(member.value)
                    }
            }
            if(arguments.length!==1) {
                return {
                    error: ``
                }
            }
            const v = arguments[0]
            let name = ''
            switch (v.type) {
                case Identifier:
                    if(!col_arr.includes(v.name)) {
                        return {
                            error: ''
                        }
                    }
                    name = v.name
                    break
                case BinaryExpression:
                    if(!col_arr.includes(v.left.name) || !col_arr.includes(v.right.name)) {
                        return {
                            error: ''
                        }
                    }
                    if(v.operator!=='+') {
                        return {
                            error: ''
                        }
                    }
                    name = `${v.left.name},${v.right.name}`
            }
            const { value } = right
            switch (rule) {
                case 'date_format':
                    if(!['yyyy-mm-dd','yyyy/mm/dd'].includes(value)) {
                        return {
                            error: ''
                        }
                    }
                    break
                case 'len':
                    if(right.type!=='NumericLiteral') {
                        return {
                            error: ''
                        }
                    }
                    break
                case 'includes':
                    if(value!==true) {
                        return {
                            error: ``
                        }
                    }
                    break
                default:
                    if(value!==false) {
                        return {
                            error: ``
                        }
                    }
            }

            const realRule = get_rule(rule)
            return {
                col: name,
                rule: realRule,
                value: right.value,
                operator,
                other: realRule === 'includes' ? { enums } : null
            }
        }
    }

}

const if_statement_handler = (ast,col_arr) => {

}

const for_of_statement_handler = (ast,col_arr) => {

}

const other_handler = (ast,col_arr) => {

}

const handlers = {
    expression_statement_handler,
    if_statement_handler,
    for_of_statement_handler,
    other_handler,
}

module.exports = {
    gen,
}
