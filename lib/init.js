const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const download = require("download-git-repo");
const { exec } = require("child_process");
const templates = require("./templates"); // 导入模板配置

// 转换为 Promise 形式
const execPromise = promisify(exec);
const execDownload = promisify(download);

async function init() {
  try {
    // 1. 选择模板
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "请选择项目模板:",
        choices: Object.keys(templates).map((key) => ({
          name: templates[key].name,
          value: key,
        })),
      },
    ]);

    // 2. 输入项目名称
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "请输入项目名称:",
        validate: (input) => {
          if (!input) {
            return "项目名称不能为空";
          }
          return true;
        },
      },
    ]);

    // 显示加载动画
    const spinner = ora("正在下载项目模板...").start();

    // 3. 下载模板
    const { repo, branch } = templates[template];
    const targetPath = path.join(process.cwd(), projectName);
    await execDownload(`${repo}#${branch}`, targetPath, { clone: true });

    // 4. 安装依赖
    spinner.text = "安装项目依赖...";
    await execPromise("npm install", { cwd: targetPath }).catch((error) => {
      console.error(chalk.red(error.message));
      spinner.fail(chalk.red("依赖安装失败"));
    });

    // 完成
    spinner.succeed(chalk.green("项目创建成功！"));
  } catch (error) {
    console.error(chalk.red("\n错误：" + error));
    process.exit(1);
  }
}

module.exports = init;
