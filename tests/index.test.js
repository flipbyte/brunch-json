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

  describe('Parser sort order', () => {
    it('orders parsers with handle argument "object" before the rest', () => {
      plugin = new BrunchJson({
        plugins: {
          brunchJSON: {
            parsers: [{
              handleAs: 'object',
              sortOrder: -2
            }, {
              handleAs: 'string',
              sortOrder: -1
            }, {
              handleAs: 'string',
              sortOrder: 10
            }, {
              handleAs: 'object',
              sortOrder: 1000
            }]
          }
        }
      });

      plugin.sort();

      expect(plugin.parsers).to.eql([{
        handleAs: 'object',
        sortOrder: 1000
      }, {
        handleAs: 'object',
        sortOrder: -2
      }, {
        handleAs: 'string',
        sortOrder: 10
      }, {
        handleAs: 'string',
        sortOrder: -1
      }])
    });
  });

  describe('Parsers in the plugin', () => {
    describe('should compile and product valid result', () => {
      it ('for combined object and string parsers', function(done) {
        var plugin = new BrunchJson({
          plugins: {
            brunchJSON: {
              parsers: [{
                handleAs: 'string',
                parse: function(data) {
                  var patt = /\"%%(.*?)%%\"/g;
                  var replacement = "$1";
                  data = data.replace(patt, replacement);
                  data = data.replace(/\\\//g, '/');
  
                  return [data];
                }
              }, {
                handleAs: 'object',
                parse: function(data) {
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
  
                    delete newData.schemas;
                  }
                  
                  return [
                    newData,
                    `export const schemas = {${schemas.join(',\n')}};\n`
                  ];
                }      
              }, {
                handleAs: 'object',
                parse: function (data) {
                  var newData = JSON.parse(data);
                  var imports = [];
                  if (newData && newData.imports) {
                    imports = _.map(newData.imports, (value, key) => `"${key}": ${value}`);
                    delete newData.imports;
                  }    
                  
                  return [
                    newData,
                    `export const imports = {${imports.join(',')}};\n`
                  ];
                }
              }]
            }
          }
        })
        var content = `{
          "imports": {
            "import1": "function () { var a = 1 + 2 }",
            "import2": "function () { alert(1) }"
          },
          "schemas": {
            "schema1": {
              "type": "Entity",
              "name": "schema1",
              "dependencies": {
                "depKey1": ["schema2"],
                "depKey2": "schema3"
              },
              "options": {
                "idAttribute": {
                  "name": "fn1",
                  "args": "value, parent, key",
                  "body": [
                    "return \`$\{parent.siteId}-$\{value.word}\`"
                  ]
                }
              }
            },
            "schema2": {
              "type": "Entity",
              "name": "schema2",
              "dependencies": {},
              "options": {}
            },
            "schema3": {
              "type": "Entity",
              "name": "schema3"
            }
          },
          "other-keys": {
            "key1": "%%require('something')%%",
            "key2": {
              "key3": "%%function(){return 1}%%",
              "key4": "something-else",
              "key5": ["%%variable-name%%", "function () { alert('dont parse this')}", "%%parseThis()%%"]
            }
          }
        }`;

        var expected = 'export const schemas = {schema1: function () {return new schema.Entity(\'schema1\', {depKey1: [this.schema2], depKey2: this.schema3}, {idAttribute: function (value, parent, key) { return `${parent.siteId}-${value.word}` }}).bind(this);},\nschema2: function () {return new schema.Entity(\'schema2\', {}, {}).bind(this);},\nschema3: function () {return new schema.Entity(\'schema3\', {}, {}).bind(this);}};\n\nexport const imports = {"import1": function () { var a = 1 + 2 },"import2": function () { alert(1) }};\n\nexports.default = {"other-keys":{"key1":require(\'something\'),"key2":{"key3":function(){return 1},"key4":"something-else","key5":[variable-name,"function () { alert(\'dont parse this\')}",parseThis()]}}}';

        plugin.compile({
          data: content,
          path: 'file.json'
        }).then(result => {
          var data = result.data;
          expect(data).to.equal(expected);
          done();
        }, error => {
          expect(error).not.to.be.ok;
          done();
        });
      });
    })
  });
})
