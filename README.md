# git-dir-config

Setup directory-based git global config

## Install

```bash
npm i -g git-dir-config
```

## Usage

Like `git config`, replace `git config` with `git dir-config`

```bash
# set
git dir-config user.name "Peppa Pig"

# get
git dir-config user.name
```

## Example

```bash

mkdir -p ~/work ~/personal

cd ~/work
git dir-config user.name "Peppa Pig"

git dir-config user.name
# => Peppa Pig

mkdir child && cd child && git init && git config user.name
# => Peppa Pig

cd ~/personal
git dir-config user.name "Little Pony"

git dir-config user.name
# => Little Pony

mkdir child && cd child && git init && git config user.name
# => Little Pony
```
