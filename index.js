'use strict';

// Documentation for Brunch plugins:
// https://github.com/brunch/brunch/blob/master/docs/plugins.md

// Remove everything your plugin doesn't need.
class FlutterConfig {
    // constructor(config) {
    //   // Replace 'plugin' with your plugin's name.
    //   // Don't include 'brunch' or 'plugin' words in configuration key.
    //   this.config = config.plugins.plugin || {};
    // }

    // Optional
    // Specifies additional files which will be included into build.
    // get include() { return ['path-to-file-1', 'path-to-file-2']; }

    // file: File => Promise[Boolean]
    // Called before every compilation. Stops it when the error is returned.
    // Examples: ESLint, JSHint, CSSCheck.
    // lint(file) { return Promise.resolve(true); }

    const paths = (obj = {}) =>
        Object.entries(obj)
        .reduce(
            (product, [key, value]) =>
            isObject(value) ?
            product.concat([
                [key, paths(value)] // adds [root, [children]] list
            ]) :
            product.concat([key]), // adds [child] list
            []
        );

    const addDelimiter = (a, b) =>
        a ? `${a}.${b}` : b;

    const pathToString = ([root, children]) =>
        children.map(
            child =>
            Array.isArray(child) ?
            addDelimiter(root, pathToString(child)) :
            addDelimiter(root, child)
        )
        .join('\n');

    const endsWith = (string, target) => {
        if (string.substr(-target.length) === target) return true;
        return false;
    };

    const updateData = (data, path, replace) => {
        var splitPath = path.split('.');
        while(splitPath.length > 1)
            data = data[splitPath.shift()];

        data[data.shift()] = replace;
    };

    requireData(data) {
        var paths = pathToString(["", paths(data)]).split("\n");
        paths.forEach(path => {
            if (endsWith(path, "require"))
                updateData(data, path, replace);
        });

        return data;
    }

    // file: File => Promise[File]
    // Transforms a file data to different data. Could change the source map etc.
    // Examples: JSX, CoffeeScript, Handlebars, SASS.
    compile(file) {
        if (!file || !file.data) {
            return Promise.resolve(file);
        }

        file.data = requireData(file.data);

        return Promise.resolve(file);
    }

    // file: File => Promise[Array: Path]
    // Allows Brunch to calculate dependants of the file and recompile them too.
    // Examples: SASS '@import's, Jade 'include'-s.
    // getDependencies(file) { return Promise.resolve(['dep.js']); }

    // file: File => Promise[File]
    // Usually called to minify or optimize the end-result.
    // Examples: UglifyJS, CSSMin.
    // optimize(file) { return Promise.resolve({data: minify(file.data)}); }

    // files: [File] => null
    // Executed when each compilation is finished.
    // Examples: Hot-reload (send a websocket push).
    // onCompile(files) {}

    // Allows to stop web-servers & other long-running entities.
    // Executed before Brunch process is closed.
    // teardown() {}
}

// Required for all Brunch plugins.
BrunchPlugin.prototype.brunchPlugin = true;

// Required for compilers, linters & optimizers.
// 'javascript', 'stylesheet' or 'template'
BrunchPlugin.prototype.type = 'javascript';

// Required for compilers & linters.
// It would filter-out the list of files to operate on.
BrunchPlugin.prototype.extension = 'js';
// BrunchPlugin.prototype.pattern = /\.jsx?$/;
// `pattern` is preferred over `extension` by Brunch.
// Please, specify only one of them.

// Indicates which environment a plugin should be applied to.
// The default value is '*' for usual plugins and
// 'production' for optimizers.
// BrunchPlugin.prototype.defaultEnv = 'production';

module.exports = FlutterConfig;
