'use strict';

const handleAs = {
  'object': 20,
  'string': 10
};

class BrunchJson {
  constructor(config) {
    this.parsers = [];
    if (
      typeof config.brunchJSON === 'object' 
      && Array.isArray(config.brunchJSON.parsers)
    ) {
      this.parsers = config.brunchJSON.parsers;
    }
  }
  
  /**
   * Sort by handleAs and sortOrder properties in the parser object
   * Sort all handleAs 'object' parsers before handleAs 'string' parsers
   * 
   * Default sortOrder = 0
   * Default handleAs = 'string'
   */
  sort() {
    this.parsers.sort((a, b) => {
      a.sortOrder = a.sortOrder || 0;
      b.sortOrder = b.sortOrder || 0;

      return (handleAs[b.handleAs || 'string'] - handleAs[a.handleAs || 'string']) 
          || (b.sortOrder || 0) - (a.sortOrder || 0);
    });
  }
  
  /**
   * Validate parser by checking it contains a function parse.
   * 
   * @param {Object} parser 
   */
  validate (parser) {  
    if (typeof parser.parse !== 'function') {
      return 'parser.parse has to be a function' + typeof parser.parser + ' provided';
    }
  
    return true;
  }

  /**
   * Parse the contents of the file using custom parsers.
   * 
   * The parse function should return one of the following:
   * 1. undefined
   * 2. Array of length 2 with the new data to replace current file.data, 
   *    and the data to be prepended to the js file once all the parsers have been 
   *    processed.
   * 3. Array of length 1 with the new data to replace current file.data
   * 
   * @param {Object} file 
   * 
   * @return undefined|Array
   */
  parse(file) {
    return function (parser) {
      var err;
      if ((err = this.validate(parser)) !== true) {
        throw Error('Invalid parser: ' . err);
      }
  
      var result = parser.parse(file);
      if (!Array.isArray(result)) {
        return;
      }
      
      file.data = typeof result[0] === 'string' ? result[0] : JSON.stringify(result[0]);
      if (result.length === 2) {
        return result[1];
      }
    }
  }

  /**
   * 1. Sort all the parsers in the appropriate order 
   * 2. Process the parsers
   * 3. Filter parser results with undefined result
   * 4. Stringify the final remaining file.data 
   * 5. Replace the file.data with all the parsed data and then the stringified data.
   * 
   * @param {*} file 
   */
  compile(file) {
    if (!file || !file.data) {
      return Promise.resolve(file);
    }

    this.sort();

    let parsed = this.parsers.map(this.parse(file).bind(this));
    parsed = parsed.filter(data => typeof data !== 'undefined');

    let data = file.data;
    // data = JSON.stringify(data, null, 4);
    // data = data.replace(/\\\//g, '/');

    file.data = parsed.join('\n');
    file.data += parsed.length > 0 ? '\n': '';
    file.data += `exports.default = ${data}`;

    return Promise.resolve(file);
  }
}

BrunchJson.prototype.brunchPlugin = true;
BrunchJson.prototype.type = 'javascript';
BrunchJson.prototype.extension = 'json';

module.exports = BrunchJson;
