# scrapie
Simple and light framework to scraping data.

## Examples
[Look here](https://github.com/SzymonLisowiec/scrapie/tree/master/examples)

## List
```javascript
const ListScrapper = require('scrapie').List;

let scrapper = new ListScrapper(options);
```
### Options
- *url* - url to scraping data
- *type* - type of response from above url. Possible types: `html`, `json`, `false`. Default is `html`.
- *delay* - delay before next request (ms)
- *request* - [request/request](https://github.com/request/request) if you need custom headers etc.

### Methods

#### Basic methods
- setProgress(fn) - set function to show progress ([look example](https://github.com/SzymonLisowiec/scrapie/blob/master/examples/humblebundle.js#L15))
- setNextPage(fn) - set function to specify a next page url, returns `false` if end of scraping. ([look example](https://github.com/SzymonLisowiec/scrapie/blob/master/examples/humblebundle.js#L27))
- setParaser(fn) - set function to parse received body. ([look example](https://github.com/SzymonLisowiec/scrapie/blob/master/examples/mediaexpert.js#L45))
- addModifier(fn) - add function to modify scraped data. ([look example](https://github.com/SzymonLisowiec/scrapie/blob/master/examples/humblebundle.js#L49))

In each above methods `fn` is function with one attribute:
- *data* - if server's response is `json`.
- *$* - if server's response is `html`. That is [Cheerio object](https://github.com/cheeriojs/cheerio)
- *body* - if server's response is none of the above. 

#### Others methods
- run() - run scraper (can be used synchronically)

### Events
#### data
- *data* [array] - scraped data on live
#### end
- *data* [array] - all scraped data

## TODO
- [ ] Autodetect type of server's response, without require `type` from options

## License
MIT License

Copyright (c) 2018 Kysune

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.