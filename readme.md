# Introduction

[中文](readme.zh-cn.md)

This repository is my attempt at a scenario I encountered in my work.

This scenario simply means that you have to do a check on the format of data in some Excel sheets and then automatically enter it into the database.
All I have to do on the front end is:

    1. create a project that allows the database maintainers to configure rules so that all Excel sheets you want to enter into the database need to pass the rule checks.
    2. show the verification results (pass,fail) to the sheet data entrants
    3. display the ruels corresponding to the project

We do the checks by the column in the Excel, the configurations are the rules that the column needs to meet, such as this column is not empty, can not be duplicated with other sheets submitted to the project...  

Our approach is to configure the rules by means of a table check or input and the display a non-editable table for the sheet filler, roughly as follows.
<table>
    <thead>
        <tr>
            <td>
                -
            </td>
            <td>
                rule1
            </td>
            <td>
                rule2
            </td>
            <td>
                ...
            </td>
            <td>
                rulen
            </td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                excel column1
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
                    <option>option 1</option>
                    <option>option 2</option>
                    <option>option 3</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                excel column2
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
                    <option>option 1</option>
                    <option>option 2</option>
                    <option>option 3</option>
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
                    <option>option 1</option>
                    <option>option 2</option>
                    <option>option 3</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                excel columnn
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
                    <option>option 1</option>
                    <option>option 2</option>
                    <option>option 3</option>
                </select>
            </td>
        </tr>
    </tbody>
</table>

However，the following problems exist.

    1. complex (many columns or column names are very long) sheets corresponding to the rules table view are troublesome. 
    2. if the rule configuration table has other functions, we encountered interaction writing trouble and long development cycle trouble, other functions such as, first do filtering, do a check for data meeting the rules.
    3. High coupling with the business, this kind of verification should be a universal requirement for many businesses, but each business needs to configure its own form style separately, so it can't be universal.

For this reason, the solution I came up with is to solve the above problem by defining dsl (domain specific language).

This dsl relies on javascript for syntax highlighting and supports the following syntax.

```javascript
    // This is a comment
    x!=null;//x column is no empty
    x>y;//x>y
    dumplicate(x)==false;//cannot dumplicated
    multi_sheet_dumplicate(x)==false;//cannot dumplicated with sheets submitted to this project
    date_format(x)=='yyyy-mm-dd';//the format of data should is yyyy-mm-dd
    len(x)>100;//the length of x greater than 100
    ['a','b','c'].includes(x) == true;//x should is one of a, b and c 
    len(x+y) > 10;//the length of the string after the splicing of x, y should be greater than 10

    if(x>100 && y< 50) {//if x greater than 100 and y less than 50
        c!=null;//c column is not empty
    }
    
    for(const x of col(['a','b','c'])) {//the rules met by column a, b and c
        x!=null;
    }
```
Where `x` and `y` represent the data of x column and y column of a certain row (their column names are x and y). The configured rules are all expressions that return true and false, which means that for each row of data, they all have to satisfy this true/false expression
I simply implemented the parsing of the first 8 rules, and the results are as follows.
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
            "rule": "column间比较",
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
where col indicates the column to be checked and rule indicates the rule to be satisfied.

How to run the program

`npm i`

`node ./parse-demo.js`
