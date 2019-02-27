'use strict';

var forEach = require('lodash.foreach');

class BrunchJson {
  compile(file) {
    if (!file || !file.data) {
      return Promise.resolve(file);
    }

    let data = JSON.parse(file.data);
    var imports = [];
    if (data && data.imports) {
      forEach(data.imports, function(value, key) {
        imports.push(`const ${key} = ${value};`);
      });

      delete data.imports;
    }

    data = JSON.stringify(data, null, 4);
    var patt = /\"%%(.+)%%\"/g;
    var replacement = "$1";
    data = data.replace(patt, replacement);
    data = data.replace(/\\\//g, '/');

    file.data = `${imports.join('\n')}`;
    file.data += imports.length > 0 ? `\n` : '';
    file.data += `exports.default = ${data}`;

    return Promise.resolve(file);
  }
}

BrunchJson.prototype.brunchPlugin = true;
BrunchJson.prototype.type = 'javascript';
BrunchJson.prototype.extension = 'json';

module.exports = BrunchJson;
