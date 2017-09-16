var resolveDeps = require('snyk-resolve-deps');
var fs = require('fs');


function getJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path).toString());
  } catch (e) {
    console.log('error reading package.json');
  }
}

function saveJson(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json, 4));
  } catch (e) {
    console.log(e);
  }
}

function checkDep(dep) {
  var bin = dep.bin || getJson(dep.__filename).bin;
  var valid = true;

  if (!bin) {
    return true;
  }

  Object.keys(bin).forEach(function(key) {
    if (bin[key].indexOf('\\') > -1) {
      valid = false;
    }
  });

  return valid;
}

function fixDep(dep) {
  console.log('Fixing bin paths for ' + dep.name);
  var json = getJson(dep.__filename);
  
  Object.keys(json.bin).forEach(function(key) {
    json.bin[key] = json.bin[key].split('\\').join('/');
  });

  saveJson(json, dep.__filename);
}

function walkTree(tree, cb) {
  Object.keys(tree).forEach(function(key) {
    cb(tree[key]);
    walkTree(tree[key].dependencies, cb);
  });
}

function checkTree(deps) {
  walkTree(deps, function (dep) {
    var valid = checkDep(dep);
    if (!valid) {
      fixDep(dep);
    }
  });
}

module.exports = {
  hooks: {
    'pre.meteor.push': function(api) {
      var appConfig = api.getConfig().app;

      if (!appConfig) {
        return;
      }

      console.log('Fixing npm dependencies bin paths');

      var path = api.resolvePath(api.getBasePath(), appConfig.path);
      return resolveDeps(path, { extraFields: ['bin'] })
        .then(function(result) {
          checkTree(result.dependencies);
        })
        .catch(console.log);
    }
  }
};