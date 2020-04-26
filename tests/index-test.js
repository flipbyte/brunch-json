import _ from 'lodash';
import BrunchJson from '../src';

describe('Brunch json', () => {
  var plugin

  beforeEach(function() {
    plugin = new BrunchJson({});
  })

  it('should be an object', () => {
    expect(plugin).to.be.ok;
  })

  it('should have #compile method', function() {
    expect(plugin.compile).to.be.an.instanceof(Function);
  })

  // describe('Parser sort order', () => {
  //   it('orders parsers with handle argument "object" before the rest', () => {
  //     plugin = new BrunchJson({
  //       brunchJSON: {
  //         parsers: [{
  //           handleAs: 'object',
  //           sortOrder: -2
  //         }, {
  //           handleAs: 'string',
  //           sortOrder: -1
  //         }, {
  //           handleAs: 'string',
  //           sortOrder: 10
  //         }, {
  //           handleAs: 'object',
  //           sortOrder: 1000
  //         }]
  //       }
  //     });

  //     plugin.sort();

  //     expect(plugin.parsers).to.eql([{
  //       handleAs: 'object',
  //       sortOrder: 1000
  //     }, {
  //       handleAs: 'object',
  //       sortOrder: -2
  //     }, {
  //       handleAs: 'string',
  //       sortOrder: 10
  //     }, {
  //       handleAs: 'string',
  //       sortOrder: -1
  //     }])
  //   });
  // });

  describe('Parser.parse using the global variable data', () => {
    it('should parse "imports" and create a separate object with all the import', function () {
      var data = '{\
        "imports": {\
          "import1": "function () { var a = 1 + 2 }",\
          "import2": "function () { alert(1) }"\
        }\
      }';

      var expected = '{"import1": "function () { var a = 1 + 2 }","import2": "function () { alert(1) }"}';

      var result = plugin.parse({
        parse: function (data) {
          var newData = JSON.parse(data);
          var imports;
          if (newData && newData.imports) {
            imports = _.map(newData.imports, (value, key) => `"${key}": "${value}"`);
            delete data.imports;
          }    
          
          return `{${imports.join(',')}}`;
        }
      }, data);

      expect(result).to.equal(expected);
    });

    it ('should parse "schemas" and create a separate object with all the schemas', function () {
      var data = '{\
        "schemas": {\
          "schema1": {\
            "type": "Entity",\
            "name": "schema1",\
            "dependencies": {\
              "depKey1": ["schema2"],\
              "depKey2": "schema3"\
            },\
            "options": {\
              "idAttribute": {\
                "name": "fn1",\
                "args": "value, parent, key",\
                "body": [\
                  "return `${parent.siteId}-${value.word}`"\
                ]\
              }\
            }\
          },\
          "schema2": {\
            "type": "Entity",\
            "name": "schema2",\
            "dependencies": {},\
            "options": {}\
          },\
          "schema3": {\
            "type": "Entity",\
            "name": "schema3"\
          }\
        }\
      }'; 
      
      var expected = "{schema1: function () {return new schema.Entity(\'schema1\', {depKey1: [this.schema2], depKey2: this.schema3}, {idAttribute: function (value, parent, key) { return `${parent.siteId}-${value.word}` }}).bind(this);},\nschema2: function () {return new schema.Entity(\'schema2\', {}, {}).bind(this);},\nschema3: function () {return new schema.Entity(\'schema3\', {}, {}).bind(this);}}";

      var result = plugin.parse({
        parse: function() {
          var newData = JSON.parse(data);
          var schemas = [];
          if (newData && newData.schemas) {
            schemas = _.map(newData.schemas, function(schema, key) {
              var dependencies = _.map(schema.dependencies, (dependency, key) => {
                var deps;
                if (_.isArray(dependency)) {
                  deps = `[this.${dependency[0]}]`;
                } else {
                  deps = `this.${dependency}`;
                }
                return `${key}: ${deps}`;
              });

              var options = _.map(schema.options, function (option, key) {
                if (typeof option === 'string') {
                  return option;
                }

                return `${key}: function (${option.args}) { ${option.body} }`;
              }); 

              var result = `${key}: function () {`
                + `return new schema.Entity(`
                  + `'${schema.name}', `
                  + `{${dependencies.join(', ')}}, `
                  + `{${options.join(', ')}}`
                + `).bind(this);`
              + `}`;

              return result;
            });
          }

          return `{${schemas.join(',\n')}}`;
        }
      });

      expect(result).to.equal(expected);
    });

    it ('should parse pattern "%%some-string%%" to "some-string" from the original data json string (modifies original JSON string)', function () {
      var data = '{\
        "key1": "%%require(\'something\')%%",\
        "key2": {\
          "key3": "%%function(){return 1}%%",\
          "key4": "something-else",\
          "key5": ["%%variable-name%%", "function () { alert(\'dont parse this\')}", "%%parseThis()%%"]\
        }\
      }';

      var expected = '{        "key1": require(\'something\'),        "key2": {          "key3": function(){return 1},          "key4": "something-else",          "key5": [variable-name, "function () { alert(\'dont parse this\')}", parseThis()]        }      }';

      var result = plugin.parse({
        parse: function() {
          // data = JSON.stringify(data, null, 4);
          var patt = /\"%%(.*?)%%\"/g;
          var replacement = "$1";
          data = data.replace(patt, replacement);
          data = data.replace(/\\\//g, '/');
        }
      });

      expect(typeof result).to.equal('undefined');
      expect(data).to.equal(expected);
    });
  });

  describe('Parsers in the plugin', () => {
    describe('should compile and product valid result', () => {
      it ('for object parser - imports', function(done) {
        var content = '{\
          "brunchJSON": {\
            "parsers": [{

            }]
          }\
          "imports": {\
            "import1": "function () { var a = 1 + 2 }",\
            "import2": "function () { alert(1) }"\
          }\
        }';
      });
    })
  });
  // it('should compile and produce valid result', function(done) {
  //   var content = '{\
  //       "key": "value",\
  //       "key2": "value2"\
  //   }';
  //   var expected = 'exports.default = "{        \\\"key\\\": \\\"value\\\",        \\\"key2\\\": \\\"value2\\\"    }"';

  //   plugin.compile({
  //     data: content,
  //     path: 'file.json'
  //   }).then(result => {
  //     var data = result.data;
  //     expect(data).to.equal(expected);
  //     done();
  //   }, error => {
  //     expect(error).not.to.be.ok;
  //     done();
  //   });
  // });

  // it('should not compile invalid file', function(done) {
  //   plugin.compile({
  //     data: null
  //   }).then(result => {
  //     var data = result.data;
  //     expect(data).to.equal(null);
  //     done();
  //   }, error => expect(error).not.to.be.ok);
  // });

  // it('should compile and parse functions wrapped inside %%{function}%%', function(done) {
  //   plugin = new BrunchJson({
  //     brunchJSON: {
  //       parsers: [{
  //         args: [/\"%%(.*?)%%\"/g, "$1"],
  //         parse: (data, pattern, replacement) => {
  //             // data = JSON.stringify(data);
  //             data = data.replace(pattern, replacement);
  
  //             console.log('third', data);
  //             return data;
  //         },
  //         sortOrder: -1
  //       }]
  //     }
  //   });
  //   var content = '{\
  //       "key": "%%require(\'some-package\').default%%",\
  //       "key2": "%%require(\'some-other-package\').default%%",\
  //       "key3": {\
  //           "key4": "%%require(\'another-package\').default%%",\
  //           "key5": "simple string"\
  //       },\
  //       "key6": true\
  //   }';
  //   var expected = 'exports.default = {\n\
  //   "key": require(\'some-package\').default,\n\
  //   "key2": require(\'some-other-package\').default,\n\
  //   "key3": {\n\
  //       "key4": require(\'another-package\').default,\n\
  //       "key5": "simple string"\n\
  //   },\n\
  //   "key6": true\n}';

  //   plugin.compile({
  //     data: content,
  //     path: 'file.json'
  //   }).then(result => {
  //     var data = result.data;
  //     console.log('first', data);
  //     expect(data).to.equal(expected);
  //     done();
  //   }, error => expect(error).not.to.be.ok);
  // });

  // // it('should compile and add values inside imports key as variables', function(done) {
  // //   var content = '{\
  // //       "imports": {\
  // //           "import1": "require(\'something\').default"\
  // //       },\
  // //       "key": "value",\
  // //       "key2": "%%import1%%"\
  // //   }';
  // //   var expected = 'const import1 = require(\'something\').default;\nexports.default = {\n\
  // //   "key": "value",\n\
  // //   "key2": import1\n}';

  // //   plugin.compile({
  // //     data: content,
  // //     path: 'file.json'
  // //   }).then(result => {
  // //     var data = result.data;
  // //     expect(data).to.equal(expected);
  // //     done();
  // //   }, error => expect(error).not.to.be.ok);
  // // });
})
