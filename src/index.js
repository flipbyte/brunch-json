'use strict';

const get = require('lodash.get');
const set = require('lodash.set');
const merge = require('lodash.merge');
const handleAs = {
  'object': 20,
  'string': 10
};

class BrunchJson {
  constructor(config) {
    this.parsers = get(config, 'brunchJSON.parsers', []);
  }
  sort() {
    this.parsers.sort((a, b) => {
      a.sortOrder = a.sortOrder || 0;
      b.sortOrder = b.sortOrder || 0;

      return (handleAs[b.handleAs || 'string'] - handleAs[a.handleAs || 'string']) 
          || (b.sortOrder || 0) - (a.sortOrder || 0);
    });
  }
  compile(file) {
    if (!file || !file.data) {
      return Promise.resolve(file);
    }

    this.sort();

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
