# node-terapeak

Node module wrapping the TeraPeak API. See https://developer.terapeak.com for API documentations

## Status: Unstable

Use this with caution. The basic tests are all passing, but you might find some misalignments between the official docs and the input and output structures. See api.json for some sample inputs that are used to test each method.

## Install

        $ npm install -g terapeak

## Test

Using a non-restricted api key:

        $ TERAPEAK_KEY=my_secret_api_key npm test -g terapeak

Using a restricted api key:
        
        $ TERAPEAK_KEY=my_secret_api_key TERAPEAK_RESTRICTED=true npm test -g terapeak

## terapeak(1)

You will need to specify an api key with the -k option. If you're using the restricted API endpoint with a valid (paid) key, include -r (see --help for details). For complete usage, including a list of commands run:

        $ terapeak --help

For help on a specific command, run:

        $ terapeak [command] --help

Currently, this has pretty limited capabilities. You can run simple keyword and category queries. But for anything complicated, you should probably use the library directly instead of the cli.

## License

(The MIT License)

Copyright (c) 2012 Ben Blair

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.