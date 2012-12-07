/*
 * Node module wrapping the TeraPeak (R) API. See https://developer.terapeak.com for API documentations 
 * This module is not affiliated with or supported by TeraPeak (R).
 * 
 * (The MIT License)
 * 
 * Copyright (c) 2012 Ben Blair
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var request = require('request');
var xml2js = require('xml2js');
var xmlbuilder = require('xmlbuilder');
var _ = require('underscore');

var API_VERSION = 2;
var RESTRICTED_API_POST_PATH = 'http://api.terapeak.com/v1/research/xml/restricted';
var RESTRICTED_API_GET_PATH = 'http://api.terapeak.com/v1/research/restricted';
var PUBLIC_API_POST_PATH = 'http://api.terapeak.com/v1/research/xml';
var PUBLIC_API_GET_PATH = 'http://api.terapeak.com/v1/research';
var META_DATA_FIELDS = [
    'Timestamp', 'ProcessingTime', 'ImageURL', 'LinkURL'
];



function Terapeak(apikey, restrictedApi) {
    this.apiKey = apikey;
    this.restrictedApi = restrictedApi || false;
}

Terapeak.prototype.getCategorySellers = function(options, callback) {
    var self = this;
    self._call('GetCategorySellers', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }

        if (!result.CategoryData) {
            // result is actually an error
            callback(JSON.stringify(result, null, 2));
            return;
        }
        
        meta.category_id = result.CategoryData.CategorySellers.category_id;
        meta.NumPages = result.CategoryData.CategorySellers.Stats.NumPages;
        meta.NumSellers = result.CategoryData.CategorySellers.Stats.NumSellers;
        var sellers = result.CategoryData.CategorySellers.Sellers.Seller;
        callback(null, sellers, meta);
    });
};

Terapeak.prototype.getCategoryStructure = function(options, callback) {
    var self = this;
    self._call('GetCategoryStructure', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        meta.category_id = result.CategoryData.CategoryStructure.category_id;
        var categories = result.CategoryData.CategoryStructure.Category;
        callback(null, categories, meta);
    });
};

Terapeak.prototype.getCategoryTopTitles = function(options, callback) {
    var self = this;
    self._call('GetCategoryTopTitles', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        meta.NumPages = result.Stats.NumPages;
        meta.NumTitles = result.Stats.NumTitles;
        var titles = result.TopTitles.TopTitle;
        callback(null, titles, meta);
    });
};

Terapeak.prototype.getCategoryTrends = function(options, callback) {
    var self = this;
    self._call('GetCategoryTrends', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        var dataPoints = result.TrendData.Category.DataPoint;
        if (!_.isArray(dataPoints)) {
            dataPoints = [ dataPoints ];
        }
        callback(null, dataPoints, meta);
    });
};

Terapeak.prototype.getCategoryHotList = function(options, callback) {
    var self = this;
    self._call('GetCategoryHotList', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        meta.NumPages = result.HotList.Stats.NumPages;
        meta.NumEntries = result.HotList.Stats.NumEntries;
        var dataPoints = result.HotList.Category;
        if (!_.isArray(dataPoints)) {
            dataPoints = [ dataPoints ];
        }
        callback(null, dataPoints, meta);
    });
};

Terapeak.prototype.getTopTitles = function(options, callback) {
    var self = this;
    self._call('GetTopTitles', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }

        debugger;
        
        meta.NumPages = result.TopTitles.Stats.NumPages;
        meta.NumEntries = result.TopTitles.Stats.NumEntries;
        if (result.ModifiedQuery && result.ModifiedQuery.RemovedWords) {
            meta.RemovedWords = result.ModifiedQuery.RemovedWords;
        }
        var dataPoints = result.TopTitles.Title;
        if (!_.isArray(dataPoints)) {
            dataPoints = [ dataPoints ];
        }
        callback(null, dataPoints, meta);
    });
};

Terapeak.prototype.getResearchResults = function(options, callback) {
    var self = this;
    self._call('GetResearchResults', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        var statistics = result.SearchResults.Statistics;
        callback(null, statistics, meta);
    });
};

Terapeak.prototype.getResearchSellers = function(options, callback) {
    var self = this;
    self._call('GetResearchSellers', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        meta.NumPages = result.Stats.NumPages;
        meta.NumSellers = result.Stats.NumSellers;
        var sellers = result.Sellers.Seller;
        callback(null, sellers, meta);
    });
};

Terapeak.prototype.getResearchTrends = function(options, callback) {
    var self = this;
    self._call('GetResearchTrends', options, function(err, result, meta) {
        if (err) {
            callback(err);
            return;
        }
        
        debugger;
        var dataPoints = result.TrendData;
        if (!_.isArray(dataPoints.Day)) {
            dataPoints.Day = [ dataPoints.Day ];
        }
        callback(null, dataPoints, meta);
    });
};

Terapeak.prototype._call = function(name, options, callback) {
    
    var self = this;

    var xml = xmlbuilder.create(name);
    xml.ele('Version').txt(API_VERSION);

    addSimpleXmlOption(xml, options);

    var body = xml.end({ pretty: true });

    var url = (self.restrictedApi ? RESTRICTED_API_POST_PATH : PUBLIC_API_POST_PATH) + '?api_key=' + self.apiKey;

    request.post(url, { body: body }, function(err, result) {
        if (err) {
            callback(err);
            return;
        }
        if (result.statusCode !== 200) {
            // TODO: parse error message from xml result
            callback('Error ' + result.body);
            return;
        }
        parseResults(name, result.body, callback);
    });
};

function parseResults(callName, xml, callback) {

    var parser = new xml2js.Parser();
    parser.parseString(xml, function(err, result) {
        if (err) {
            callback(err);
            return;
        }

        var root = result[callName];

        var meta = {};
        var dataRoot = {};

        _.chain(root).keys().each(function(key) {
            if (key === '$') {
                // ignore $ on root, as it only contains an empty xmlns field
            } else if (_.contains(META_DATA_FIELDS, key)) {
                meta[key] = root[key];
            } else {
                dataRoot[key] = root[key];
            }
        });

        var data = flattenResults(dataRoot);

        callback(null, data, meta);
    });    
}

function flattenResults(data) {
    var flat = {};

    if (_.isString(data)) {
        return data;
    }

    if (_.isArray(data)) {
        return _.map(data, function(item) {
            return flattenResults(item);
        });
    }

    // for each property:
    // 1. promote the "$" value if there's only a single attribute
    // 2. turn an array value with a single item into a non-array value

    _.chain(data).keys().each(function(key) {
        var value = data[key];
        if (key === '$') {
            _.chain(value).keys().each(function(attrKey) {
                flat[attrKey] = flattenResults(value[attrKey]);
            });
        } else if (_.isArray(value) && value.length === 1) {
            flat[key] = flattenResults(value[0]);
        } else {
            flat[key] = flattenResults(value);
        }
    });

    return flat;
}

function addSimpleXmlOption(xml, options) {
    _.chain(options).keys().each(function(name) {
        var optionXml = xml.ele(name);
        var value = options[name];
        if (_.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                addSimpleXmlOption(optionXml, value[i]);
            }
        } else if(_.isObject(value)) {
            addSimpleXmlOption(optionXml, value);
        } else {
            optionXml.txt(value);
        }
    });
}

module.exports = Terapeak;