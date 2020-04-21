'use strict';

const get = require('lodash.get');

class BrunchJson {
  constructor(config) {
    this.parsers = config.BrunchJSON.parsers || [];
  }
  compile(file) {
    if (!file || !file.data) {
      return Promise.resolve(file);
    }

    this.parsers.sort((a, b) => {
      a.sortOrder = a.sortOrder || 0;
      b.sortOrder = b.sortOrder || 0;

      if (a.sortOrder < b.sortOrder) return 1;
      if (a.sortOrder > b.sortOrder) return -1;
      return 0;
    })

    this.parsers.forEach((parser) => {
      var data;
      if (typeof parser.get === 'string') {
        data = get(file.data, parser.get, null);
      } else if (typeof parser.get === 'function') {
        data = parser.get(file);
      } else {
        return;
      }

      if (typeof parser.parse === 'function' && data) {
        file.data += parser.parse(data);
      }
    });

    let data = file.data
    data = JSON.stringify(data, null, 4);
    file.data += `exports.default = ${data}`;

    return Promise.resolve(file);
  }
}

BrunchJson.prototype.brunchPlugin = true;
BrunchJson.prototype.type = 'javascript';
BrunchJson.prototype.extension = 'json';

module.exports = BrunchJson;
