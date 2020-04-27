# brunch-json
[Developed by Flipbyte](https://www.flipbyte.com/)

[![Build Status][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![license][license-badge]][license]
[![Codacy Badge][codacy-badge]][codacy]

brunch-json adds json support to brunch and also allows defining functions among other things in json.

## Installation

You can install brunch-json from npm as follows:

```js
$ npm install --save-dev @flipbyte/brunch-json
```

## Configuration

You can pass custom parser object as follows:

```js
{
    brunchJSON: {
        parsers: [
            {
                handleAs: 'string',
                parse: function(file) {
                    // your code
                    // return; OR
                    // return [data, result] OR
                    // return [data]
                }
            },
         ...
        ]
    }
}
```

#### Parser properties:
- `handleAs` - 'string' | 'object' - (`Default`: string) This is just for prioritizing the object parsers over string parsers.  
    - String parsers are the ones that directly manipulate the JSON string. 
    - Object parsers parse the JSON string and process the object.

    **Note** Handling the string parsers before the object parsers may cause issues if the JSON string has been modified to be valid JS object with (say) function definitions, while making it an invalid JSON string. object parsers most likely will use JSON.parse or other alternatives which will throw an error if the JSON string isn't valid.
- `parse` - a callback function that receives 'file' as an argument. You can use this to modify the contents of the final compiled file in your customized format.
- `sortOrder` - used to sort the parsers along with 'handleAs' property. (`Default`: 0)

## License
The MIT License (MIT)

[build-badge]: https://travis-ci.org/flipbyte/brunch-json.svg?branch=master
[build]: https://travis-ci.org/flipbyte/brunch-json

[npm-badge]: https://img.shields.io/npm/v/@flipbyte/brunch-json.svg
[npm]: https://www.npmjs.com/package/@flipbyte/brunch-json

[coveralls-badge]: https://coveralls.io/repos/github/flipbyte/brunch-json/badge.svg
[coveralls]: https://coveralls.io/github/flipbyte/brunch-json

[license-badge]: https://badgen.now.sh/badge/license/MIT
[license]: ./LICENSE

[codacy-badge]: https://api.codacy.com/project/badge/Grade/99ccf51b90ab46b5b2d5bb745d5a2411
[codacy]: https://www.codacy.com/app/flipbyte/brunch-json?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=flipbyte/brunch-json&amp;utm_campaign=Badge_Grade
