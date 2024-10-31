const inquirer = require('inquirer');
const download = require('download-git-repo');
const fs = require('fs');
const { exec } = require('child_process');
const init = require('../../lib/init');

jest.mock('inquirer');
jest.mock('download-git-repo');
jest.mock('child_process');

describe('Project Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create project with valid inputs', async () => {
    // Mock user inputs
    inquirer.prompt.mockResolvedValueOnce({ template: 'vue3-ts' });
    inquirer.prompt.mockResolvedValueOnce({ projectName: 'test-project' });
    
    // Mock download and exec
    download.mockImplementation((repo, path, opts, callback) => callback(null));
    exec.mockImplementation((cmd, opts, callback) => callback(null));

    await init();

    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(download).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(2); // git init and npm install
  });

  test('should handle download errors', async () => {
    inquirer.prompt.mockResolvedValueOnce({ template: 'vue3-ts' });
    inquirer.prompt.mockResolvedValueOnce({ projectName: 'test-project' });
    
    download.mockImplementation((repo, path, opts, callback) => 
      callback(new Error('Download failed'))
    );

    await expect(init()).rejects.toThrow('Download failed');
  });
});
