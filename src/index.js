'use strict';

const get = require('lodash.get');
const set = require('lodash.set');
const merge = require('lodash.merge');

class BrunchJson {
  constructor(config) {
    this.parsers = get(config, 'brunchJSON.parsers', []);
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
    });

    var parsed = [];
    this.parsers.forEach((parser) => {
      if (parser.get && typeof parser.get !== 'function') {
        throw Error('parser.get has to be a function ' + typeof parser.get + ' provided.');
      }

      var data = parser.get ? parser.get(file.data) : file.data;
      if (!data) {
        return;
      }

      if (typeof parser.parse === 'function' && data) {
        let args = [data].concat(parser.args);
        let parsedData = parser.parse.apply(this, args);
        console.log('parsedData', parsedData, this.parseJson(parsedData));
        let mergeData = parser.set 
          ? set({}, parser.set, this.parseJson(parsedData)) 
          : this.parseJson(parsedData);
        if (Array.isArray(parsedData) && parsedData.length == 2) {
          mergeData = this.parseJson(parsedData[0]);
          parsed.push(parsedData[1]);
        }

        file.data = merge({}, file.data, mergeData);
      }
    });

    let data = file.data
    data = JSON.stringify(data, null, 4);
    data = data.replace(/\\\//g, '/');

    file.data = parsed.join('\n');
    file.data += parsed.length > 0 ? '\n': '';
    file.data += `exports.default = ${data}`;

    return Promise.resolve(file);
  }
  parseJson(jsonStr) {
    return (new Function( "return " + jsonStr ) )() ;
  }
}

BrunchJson.prototype.brunchPlugin = true;
BrunchJson.prototype.type = 'javascript';
BrunchJson.prototype.extension = 'json';

module.exports = BrunchJson;
