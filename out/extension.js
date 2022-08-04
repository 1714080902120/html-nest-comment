"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;



const vscode = require('vscode');


function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error);
	console.log('已激活html-nest-commet~')

	// 注册命令
	let htmlcomment = vscode.commands.registerCommand("html-nest-comment.comment", () => {

		// 当前获取编辑器
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const allSelection = editor.selection;
		let start = new vscode.Position(allSelection.start.line, 0);
		let end = new vscode.Position(allSelection.end.line, 99999999999999999999999999999999);
		let range = new vscode.Range(start, end);
		
		// 获取选择的那段文本
		const text = editor.document.getText(range);
		let textTrim = text.trim();
		// 准备注释
		const startTag = "<!-- nest_comment_start~";
		const endTag = "~nest_comment_end -->";
		let count = 0;

		if (!textTrim.includes(startTag) && !textTrim.includes(endTag)) {

			editor.edit((editBuilder) => {
				let commentCodeTrim = replaceComment(true, textTrim);
				if (textTrim) {
					editBuilder.replace(range, text.replace(textTrim, commentCodeTrim));
				}
				else {
					editBuilder.replace(range, text + commentCodeTrim); // 空白行
				}
			});
		} else if (textTrim.includes(startTag) && textTrim.includes(endTag)) {
			// 注释回来
			editor.edit((editBuilder) => {
				let commentCodeTrim = replaceComment(false, textTrim);
				editBuilder.replace(range, text.replace(textTrim, commentCodeTrim));
			});
		} else {
			setErrorCount(context);
			const count = getErrorCount(context);
			if (count <= 2) {
				vscode.window.showErrorMessage('哥们，你注释的层级不对欸');
			} else if (count <= 10) {
				vscode.window.showErrorMessage('你怎么老是对不准？你不对劲');
			} else if (count <= 20) {
				vscode.window.showErrorMessage('你故意找茬是不是？');
			} else {
				vscode.window.showErrorMessage('男人嘛，dddd');
			}
		}
	});
	context.subscriptions.push(htmlcomment);
}

// 替换HTML代码注释
function replaceComment(isComment, text) {
	const startTag = "<!-- nest_comment_start~";
	const endTag = "~nest_comment_end -->";
	let textTemp = text;
	if (isComment) {
		const list = [];
		let s = '';
		let i = 0;
		while (i < textTemp.length) {
			const item = textTemp[i]

			if (item === '<' && textTemp[i + 1] === '!') {
				if ((s.trim()).length > 0) {
					// 自身是注释节点
					if (s.includes('<!--')) {
						list.push(s);
					} else {
						list.push(`${startTag}${s}${endTag}`);
					}
				}
				s = `${item}`;
			} else if (item === '>' && textTemp[i - 1] === '-' && textTemp[i - 2] === '-') {
				s += item;
				list.push(s)
				s = ''
			} else {
				s += item;
			}
			i++;
		}
		if ((s.trim()).length > 0) {
			list.push(`${startTag}${s}${endTag}`)
		}
		if (!list[list.length - 1].includes('-->')) {
			list[list.length - 1] = `${list[list.length - 1]}${endTag}`
		}
		return list.join('');
	}
	else {
		textTemp = textTemp.replace(/<!-- nest_comment_start~/g, "");
		textTemp = textTemp.replace(/~nest_comment_end -->/g, "");
		return textTemp
	}
}

function getErrorCount(context) {
    const key = "errorCount";
    let value = context.globalState.get(key);
    if (!value) {
        value = "0"; // 初始化
        context.globalState.update(key, value);
    }
    return parseInt(value);
}
function setErrorCount(context) {
    const key = "errorCount";
    let value = context.globalState.get(key);
    if (!value) {
        value = "1"; // 初始化
        context.globalState.update(key, value);
    } else {
        let valueNumber = parseInt(value) + 1;
		if (valueNumber >= 40) {
			valueNumber = 1;
		}
        context.globalState.update(key, valueNumber);
    }
    return value;
}

function deactivate() { }
exports.activate = activate;
exports.deactivate = deactivate;
