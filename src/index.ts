#!/usr/bin/env node
import os from 'os'
import path from 'path'
import ini from 'ini'
import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import which from 'which'
import { spawn } from 'child_process'
import lodashGet from 'lodash.get'
import lodashSet from 'lodash.set'

type NotPromise<T> = T extends Promise<infer U> ? never : T;

const _argv = yargs(hideBin(process.argv)).argv
const argv = _argv as NotPromise<typeof _argv> 
const [key, value] = argv._;
const homeDir = os.homedir();

const basename = '.gitconfig'

const parseGitConfigFile = (file: string) => {
  if (fs.existsSync(file)) {
    const config = ini.parse(fs.readFileSync(file, 'utf-8'));
    return config;
  }
  return {};
}

const hasGitBin = () => {
  try {
    which.sync('git');
    return true;
  } catch (e) {
    return false;
  }
}

// user global .gitconfig
const homeGitConfigFile = path.join(homeDir, '.gitconfig');
const homeGitConfig = parseGitConfigFile(homeGitConfigFile);

const cwd = process.cwd();

// current dir .gitconfig
let dirGitConfigFile = path.join(cwd, basename);
if (dirGitConfigFile === homeGitConfigFile) {
  dirGitConfigFile += '.include';
}
const dirGitConfig = parseGitConfigFile(dirGitConfigFile);

if (value === undefined) {
  // getter mode, output current setting
  if (hasGitBin()) {
    spawn('git', ['config', String(key)], { stdio: 'inherit' })
  } else {
    const result = lodashGet(dirGitConfig, key, undefined) || lodashGet(homeGitConfig, key, undefined);
    if (result) {
      console.log(result)
    }
  }

  // exit
  process.exit(0)
} else {
  // setter mode
  lodashSet(dirGitConfig, key, value)
  const dirConfigStr = ini.stringify(dirGitConfig);
  fs.writeFileSync(dirGitConfigFile, dirConfigStr, 'utf-8');

  const conditionIncludeKey = `includeIf "gitdir:${cwd}"`
  homeGitConfig[conditionIncludeKey] = {
    path: dirGitConfigFile
  }

  const homeConfigStr = ini.stringify(homeGitConfig);
  fs.writeFileSync(homeGitConfigFile, homeConfigStr, 'utf-8');
}
