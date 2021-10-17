#!/usr/bin/env node
import os from 'os'
import path from 'path'
import ini from 'ini'
import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
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

// user global .gitconfig
const homeGitConfigFile = path.join(homeDir, '.gitconfig');
const homeGitConfig = parseGitConfigFile(homeGitConfigFile);

const cwd = process.cwd();
const conditionIncludeKey = `includeIf "gitdir:${cwd}/"`

// current dir .gitconfig
let dirGitConfigFile = path.join(cwd, basename);
if (dirGitConfigFile === homeGitConfigFile) {
  dirGitConfigFile += '.include';
}
const dirGitConfig = parseGitConfigFile(dirGitConfigFile);

if (value === undefined) {
  // getter mode, output current setting
  let result = lodashGet(homeGitConfig, key, undefined);
  const dirConfigResult = lodashGet(dirGitConfig, key, undefined)
  if (dirConfigResult !== undefined && homeGitConfig[conditionIncludeKey]?.path === dirGitConfigFile) {
    result = dirConfigResult;
  }
  if (result) {
    console.log(result)
  }

  // exit
  process.exit(0)
} else {
  // setter mode
  lodashSet(dirGitConfig, key, value)
  const dirConfigStr = ini.stringify(dirGitConfig);
  fs.writeFileSync(dirGitConfigFile, dirConfigStr, 'utf-8');

  homeGitConfig[conditionIncludeKey] = {
    path: dirGitConfigFile
  }

  const homeConfigStr = ini.stringify(homeGitConfig);
  fs.writeFileSync(homeGitConfigFile, homeConfigStr, 'utf-8');
}
