/*
 * Node module wrapping the TeraPeak API. See https://developer.terapeak.com for API documentations
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

var apiMethods = require('./api-methods.json');

initializeOptionGroups(apiMethods);


var API_VERSION = 2;
var RESTRICTED_API_POST_PATH = 'http://api.terapeak.com/v1/research/xml/restricted';
var RESTRICTED_API_GET_PATH = 'http://api.terapeak.com/v1/research/restricted';
var PUBLIC_API_POST_PATH = 'http://api.terapeak.com/v1/research/xml';
var PUBLIC_API_GET_PATH = 'http://api.terapeak.com/v1/research';



function Terapeak(apikey, restrictedApi) {
    this.apiKey = apikey;
    this.restrictedApi = restrictedApi || false;
};

Terapeak.prototype.listMethods() {
    return apiMethods;
}

Terapeak.prototype._call(name, options, callback) {
    var method = apiMethods.methods[name];
    var xml = builder.create(name);
    addSimpleXmlOption(xml, options);

    var body = xml.end({ pretty: true });

    // TODO: post body, get result, parse & return
}

function addSimpleXmlOption(xml, options) {
    _.chain(options).keys(function(name) {
        var optionXml = xml.ele(name);
        var value = options[name];
        if (_.isArray(value)) {
            for (i = 0; i < value.length; i++) {
                addSimpleXmlOption(optionXml, value[i]);
            }
        } else if(_.isObject(value)) {
            addSimpleXmlOption(optionXml, value);
        } else {
            optionXml.txt(value);
        }
    });
}

// Following two methods are for validating input against the full api-structure.
// Ignore for now...
function addXmlValidatedOption(xml, option, value) {
    if (option === null || option === undefined || value === null || value === undefined) {
        return xml;
    }
    var i;
    var optionXml = xml.ele(option.name);

    if (option.repeating) {
        if (Array.isArray(value)) {
            for (i = 0; i < value.length; i++) {
                addXmlOption(optionXml, option, value[i]);
            }
        }
        return xml;
    }

    if (option.type !== 'group') {
        optionXml.txt(value);
        return xml;
    }

    for (i = 0; i < option.children.length; i++) {
        var child = option.children[i];
        if (child && child.name && value.hasOwnProperty(child.name)) {
            addXmlOption(optionXml, option, value[child.name]);
        }
    }

    return xml;
}

function initializeOptionGroups(api) {
    var optionGroups = api.optionGroups;
    for (var i = 0; i < api.methods.length; i++) {
        var method = api.methods[i];
        var groups = method.optionGroups;
        if (groups && groups.length > 0) {
            for (var j = 0; j < groups.length; j++) {
                var groupName = groups[j];
                var match = optionGroups[groupName];
                if (match) {
                    method.options.push(match);
                }
            }
        }
    }
}