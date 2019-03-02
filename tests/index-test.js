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

  it('should compile and produce valid result', function(done) {
    var content = '{\
        "key": "value",\
        "key2": "value2"\
    }';
    var expected = 'exports.default = {\n\
    "key": "value",\n\
    "key2": "value2"\n}';

    plugin.compile({
      data: content,
      path: 'file.json'
    }).then(result => {
      var data = result.data;
      expect(data).to.equal(expected);
      done();
    }, error => expect(error).not.to.be.ok);
  });

  it('should not compile invalid file', function(done) {
    var content = '{\
        "key": "value",\
        "key2": "value2"\
    }';

    plugin.compile({
      data: null
    }).then(result => {
      var data = result.data;
      expect(data).to.equal(null);
      done();
    }, error => expect(error).not.to.be.ok);
  });

  it('should compile and parse functions wrapping inside %%{function}%%', function(done) {
    var content = '{\
        "key": "%%require(\'some-package\').default%%",\
        "key2": "%%require(\'some-other-package\').default%%",\
        "key3": {\
            "key4": "%%require(\'another-package\').default%%",\
            "key5": "simple string"\
        },\
        "key6": true\
    }';
    var expected = 'exports.default = {\n\
    "key": require(\'some-package\').default,\n\
    "key2": require(\'some-other-package\').default,\n\
    "key3": {\n\
        "key4": require(\'another-package\').default,\n\
        "key5": "simple string"\n\
    },\n\
    "key6": true\n}';

    plugin.compile({
      data: content,
      path: 'file.json'
    }).then(result => {
      var data = result.data;
      expect(data).to.equal(expected);
      done();
    }, error => expect(error).not.to.be.ok);
  });

  it('should compile and add values inside imports key as variables', function(done) {
    var content = '{\
        "imports": {\
            "import1": "require(\'something\').default"\
        },\
        "key": "value",\
        "key2": "%%import1%%"\
    }';
    var expected = 'const import1 = require(\'something\').default;\nexports.default = {\n\
    "key": "value",\n\
    "key2": import1\n}';

    plugin.compile({
      data: content,
      path: 'file.json'
    }).then(result => {
      var data = result.data;
      expect(data).to.equal(expected);
      done();
    }, error => expect(error).not.to.be.ok);
  });
})
