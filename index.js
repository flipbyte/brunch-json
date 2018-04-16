'use strict';

class FlutterConfig {
    compile(file) {
        if (!file || !file.data) {
            return Promise.resolve(file);
        }

        var patt = /\"require\((['"](.*)['"])\)\"/g;
        var replacement = "require('$2')";
        file.data = file.data.replace(patt, replacement);
        file.data = file.data.replace(/\\\//g, '/');
        file.data = `module.exports = ${file.data}`;
        return Promise.resolve(file);
    }
}

FlutterConfig.prototype.brunchPlugin = true;
FlutterConfig.prototype.type = 'javascript';
FlutterConfig.prototype.extension = 'json';

module.exports = FlutterConfig;
