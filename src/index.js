'use strict';

const get = require('lodash.get');
const set = require('lodash.set');
const merge = require('lodash.merge');
const handleAs = {
  'object': 20,
  'string': 10
};

// const parsers = {
//   object: (file, config) => {
//     var data = JSON.parse(file.data);
//     var data = parser.get ? parser.get(file.data) : file.data;
//     if (!data) {
//       return;
//     }

//     let args = [data].concat(parser.args);
//     let parsedData = parser.parse.apply(this, args);

//     if (Array.isArray(parsedData) && parsedData.length == 2) {
//       mergeData = parsedData[0];
//       parsed.push(parsedData[1]);
//     } else {
//       mergeData = parser.set 
//         ? set({}, parser.set, this.parseJson(parsedData)) 
//         : this.parseJson(parsedData);
//     }
//   },
//   string: (file, config) => {

//   }
// };

// const parsers = {
//   object: (file, config) => {
//     var data;
//     if (typeof config.beforeParse === 'function') {
//       data = config.beforeParse(file);
//     }

//     if (!data) {
//       return;
//     }

//     let args = [data].concat(config.args);
//     let parsedData = config.parse.apply(this, args);

//     if (typeof config.afterParse === 'function') {
//       parser.afterParse(file);
//     }
//   },
//   string: (file, config) => {

//   },

//   __dispatch: (file, config) => {

//   }
// };

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
  
  validate (parser) {
    // if (parser.get && typeof parser.get !== 'function') {
    //   return 'parser.get has to be a function ' + typeof parser.get + ' provided.';
    // }
  
    if (typeof parser.parse !== 'function') {
      return 'parser.parse has to be a function' + typeof parser.parser + ' provided';
    }
  
    // if (!parsers[parser.handleAs]) {
    //   return 'Invalid parser.handleAs ' + parser.handleAs + ' provided (only string or object are possible)';
    // }
  
    return true;
  }

  parse(parser, data) {
    var err;
    if ((err = this.validate(parser)) !== true) {
      throw Error('Invalid parser: ' . err);
    }
    
    return parser.parse(data);
  }

  compile(file) {
    if (!file || !file.data) {
      return Promise.resolve(file);
    }

    this.sort();

    var parsed = this.parsers.map(this.parse.bind(this, file.data));

    // this.parsers.forEach((parser) => {
    //   if ((err = this.validate(parser)) !== true) {
    //     throw Error('Invalid parser: ' . err);
    //   }

    //   parsers[parser.handleAs](file, parser);

    //   var data = parser.get ? parser.get(file.data) : file.data;
    //   if (!data) {
    //     return;
    //   }

    //   if (typeof parser.parse === 'function' && data) {
    //     let args = [data].concat(parser.args);
    //     let parsedData = parser.parse.apply(this, args);
    //     if (parser.handleAs === 'object') {
    //       var mergeData;
    //       if (Array.isArray(parsedData) && parsedData.length == 2) {
    //         mergeData = this.parseJson(parsedData[0]);
    //         parsed.push(parsedData[1]);
    //       } else {
    //         mergeData = parser.set 
    //         ? set({}, parser.set, this.parseJson(parsedData)) 
    //         : this.parseJson(parsedData);
    //       }
    //       file.data = JSON.stringify(merge({}, file.data, mergeData));
    //     } else if (parser.handleAs === 'string') {
    //       file.data = parsedData;
    //     }
    //   }
    // });

    let data = file.data;
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
