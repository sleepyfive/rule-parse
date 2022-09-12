# 简介(Introduction)

[English](readme.md)

这个仓库是我对工作中遇到的一个场景的尝试。

这个场景简单来说就是要对一些excel表格里的数据格式做校验，然后自动录入到数据库。
前端这边要做的就是：

    1. 创建一个项目，允许数据库维护者配置规则，想要录入到该数据库表的excel表格都需要通过规则校验
    2. 向表格数据的录入者展示校验结果（通过，失败）
    3. 展示该项目对应的规则

我们做校验是以excel里的列为单位，配置的都是这一列需要满足的规则，比如这一列非空，不能和提交到该项目里的其他excel重复......

我们的做法是通过表格勾选或者输入的方式配置规则，然后展示一个不可编辑的表格给excel填写者，大致如下：

<table>
    <thead>
        <tr>
            <td>
                -
            </td>
            <td>
                规则1
            </td>
            <td>
                规则2
            </td>
            <td>
                ...
            </td>
            <td>
                规则n
            </td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                excel 列1
            </td>
            <td>
                <input type="checkbox">
            </td>
            <td>
                <input value="123">
            </td>
            <td>
                ...
            </td>
            <td>
                <select>
                    <option>选项1</option>
                    <option>选项2</option>
                    <option>选项3</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                excel 列2
            </td>
            <td>
                <input type="checkbox" checked>
            </td>
            <td>
                <input>
            </td>
            <td>
                ...
            </td>
            <td>
                <select>
                    <option>选项1</option>
                    <option>选项2</option>
                    <option>选项3</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                ...
            </td>
            <td>
                <input type="checkbox">
            </td>
            <td>
                <input>
            </td>
            <td>
                ...
            </td>
            <td>
                <select>
                    <option>选项1</option>
                    <option>选项2</option>
                    <option>选项3</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                excel 列n
            </td>
            <td>
                <input type="checkbox" checked>
            </td>
            <td>
                <input>
            </td>
            <td>
                ...
            </td>
            <td>
                <select>
                    <option>选项1</option>
                    <option>选项2</option>
                    <option>选项3</option>
                </select>
            </td>
        </tr>
    </tbody>
</table>

但是存在如下问题：

    1. 复杂（列很多，列名字很长）的excel对应的规则表格查看很麻烦
    2. 带有其他功能的规则配置表格，交互编写麻烦，开发周期长，其他功能例如，先做数据筛选，满足条件的数据再去校验
    3. 和业务耦合度高，这种校验应该是很多业务通用性的需求，但是每个业务需要单独配置自己的表格样式，无法做到通用

为此，我想出的解决方案是，通过定义dsl（领域特定语言）的方式，来解决上述问题。

这个dsl依赖于javascript做语法高亮，支持以下的语法

```javascript
    // 这是一个注释
    x!=null;//x列非空
    x>y;//x>y
    dumplicate(x)==false;//x列不能重复
    multi_sheet_dumplicate(x)==false;//该规则下的所有excel表的x列不能重复
    date_format(x)=='yyyy-mm-dd';//x列应为yyyy-mm-dd日期格式
    len(x)>100;// 字符串x的长度应该大于100
    ['a','b','c'].includes(x) == true;// x应该为a、b、c种的一个
    len(x+y) > 10;//x+y拼接后的字符串长度大于100

    if(x>100 && y< 50) {//如果x大于100 并且 y小于50
        c!=null;//c不能为空
    }
    
    for(const x of col(['a','b','c'])) {//a、b、c三列都要满足的规则
        x!=null;
    }
```
其中，`x`、`y`表示某一行的x列和y列的数据（它们的列名叫做x和y）。 配置的规则均为返回true、false的表达式，这代表着，对于每一行的数据，它们都要满足这个true/false表达式
我简单地实现了下前8条规则的解析，结果如下：
```json
{
    "rules": [
        {
            "col": "x",
            "rule": "值比较",
            "operator": "!=",
            "value": null
        },
        {
            "col": "x",
            "rule": "列间比较",
            "operator": ">",
            "value": "y"
        },
        {
            "col": "x",
            "rule": "dumplicate",
            "value": false,
            "operator": "==",
            "other": null
        },
        {
            "col": "x",
            "rule": "multi_sheet_dumplicate",
            "value": false,
            "operator": "==",
            "other": null
        },
        {
            "col": "x",
            "rule": "date_format",
            "value": "yyyy-mm-dd",
            "operator": "==",
            "other": null
        },
        {
            "col": "x",
            "rule": "len",
            "value": 100,
            "operator": ">",
            "other": null
        },
        {
            "col": "x",
            "rule": "includes",
            "value": true,
            "operator": "==",
            "other": {
                "enums": [
                    "a",
                    "b",
                    "c"
                ]
            }
        },
        {
            "col": "x,y",
            "rule": "len",
            "value": 10,
            "operator": ">",
            "other": null
        }
    ],
    "warnings": []
}

```
其中，col表示要校验的列，rule表示要满足的规则。

运行方式

`npm i`

`node ./parse-demo.js`
