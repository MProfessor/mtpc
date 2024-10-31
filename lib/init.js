const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const download = require('download-git-repo');
const { promisify } = require('util');
const { exec } = require('child_process');

// 转换为 Promise 形式
const downloadRepo = promisify(download);
const execPromise = promisify(exec);

// 模板配置
const templates = require('./templates');

async function init() {
  try {
    // 1. 选择模板
    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: '请选择项目模板:',
        choices: Object.keys(templates).map(key => ({
          name: templates[key].name,
          value: key
        }))
      }
    ]);

    // 2. 输入项目名称
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称:',
        validate: input => {
          if (!input) {
            return '项目名称不能为空';
          }
          return true;
        }
      }
    ]);

    // 显示加载动画
    const spinner = ora('正在下载项目模板...').start();

    // 3. 下载模板
    const targetPath = path.join(process.cwd(), projectName);
    await downloadRepo(templates[template].repo, targetPath, { clone: true });

    const gitPath = path.join(targetPath, '.git');
    // 使用 fs-extra 确保安全删除
    await fs.remove(gitPath);
    
    // 4. 初始化 git
    spinner.text = '初始化 Git 仓库...';
    await execPromise('git init', { cwd: targetPath });

    // 5. 安装依赖
    spinner.text = '安装项目依赖...';
    await execPromise('npm install', { cwd: targetPath });

    // 完成
    spinner.succeed(chalk.green('项目创建成功！'));
    console.log(chalk.blue('\n请执行以下命令开始开发：'));
    console.log(chalk.cyan(`\n  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev\n'));

  } catch (error) {
    console.error(chalk.red('\n错误：' + error.message));
    process.exit(1);
  }
}

module.exports = init;