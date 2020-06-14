/**
 * Original:
 * https://github.com/necolas/react-native-web/blob/master/scripts/babel/createModuleMap.js
 *
 * Creates a map of exported modules, allowing the startupjs-babel-plugin to rewrite
 * paths only for modules it knows are exported by startupjs.
 */
const fs = require('fs')
const path = require('path')

const PACKAGES_DIR = path.join(__dirname, '../../packages/')
const MODULE_MAP_FILE = path.join(PACKAGES_DIR, 'babel-plugin-startupjs/moduleMap.json')
const MODULE_DIRS = {
  '@startupjs/ui': [
    { source: path.join(PACKAGES_DIR, 'ui/components') },
    { source: path.join(PACKAGES_DIR, 'ui/theming'), includeFiles: true }
  ]
}

main()

function main () {
  let moduleMap = {
    '// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.': 0
  }
  for (const moduleName in MODULE_DIRS) {
    moduleMap[moduleName] = MODULE_DIRS[moduleName].reduce(
      (map, dir) => ({ ...map, ...getModuleMap(dir) }),
      {}
    )
  }

  const data = JSON.stringify(moduleMap, null, 2)

  fs.writeFileSync(MODULE_MAP_FILE, data)
}

function getModuleMap ({ source, includeFiles }) {
  const baseName = path.basename(source)
  if (isDirectory(source)) {
    // if directory starts at small letter -- this is a subdirectory
    // with components, go inside it
    if (/^[a-z]/.test(baseName)) {
      return fs.readdirSync(source).reduce((map, baseName) => ({
        ...map,
        ...getModuleMap({ source: path.join(source, baseName), includeFiles })
      }), {})
    } else {
      return { [baseName]: relativePath(source) }
    }
  } else if (
    includeFiles &&
    /\.jsx?$/.test(baseName) &&
    !/^index/.test(baseName)
  ) {
    const name = baseName.replace(/\.jsx?$/, '')
    return { [name]: relativePath(source) }
  } else {
    return {}
  }
}

function relativePath (source) {
  return path.relative(PACKAGES_DIR, source).replace(/^[^/]+/, '')
}

function isDirectory (source) {
  return fs.lstatSync(source).isDirectory()
}