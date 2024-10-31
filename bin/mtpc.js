#!/usr/bin/env node
const program = require('commander');
const init = require('../lib/init');

program
  .version(require('../package.json').version)
  .command('init')
  .description('创建新项目')
  .action(init);

program.parse(process.argv);