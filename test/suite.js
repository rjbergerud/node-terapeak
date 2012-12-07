// Terapeak tests

var assert = require('assert');
var _ = require('underscore');
var Terapeak = require('../terapeak');
var docs = require('../api.json');

var TEST_PUBLIC_KEY = 'j45nrc43wrheap4jwpf3v8mg';

var apiKey = process.env.TERAPEAK_KEY || TEST_PUBLIC_KEY;
var restrictedApi = false;

if (!apiKey) {
    assert.fail('Must specify TERAPEAK_KEY environment variable');
}

if (process.env.TERAPEAK_RESTRICTED) {
    restrictedApi = true;
}

var terapeak = new Terapeak(apiKey, restrictedApi);

var categoryOptions = {
    CategoryQuery: {
        Categories: [
            {
                CategoryID: "175706"
            }
        ]
    }
};

var searchOptions = {
    SearchQuery: {
        Keywords: 'iPad 2',
        CategoryLimit: [
            {
                CategoryID: '171485'
            }
        ]
    }
};

describe('terapeak', function() {
    docs.methods.forEach(function(method) {
        var apiMethodName = method.name[0].toLowerCase() + method.name.slice(1);
        var apiMethod = Terapeak.prototype[apiMethodName];

        describe('#' + apiMethodName + '()', function() {
            if (!apiMethod) {
                it('should be defined');
                return;
            }
            it('should return a collection of results without error', function(done) {
                this.timeout(10000); // set a high timeout, as terapeak is sometimes a bit slow to respond.
                var options = {};
                if (method.isCategoryQuery) {
                    options = categoryOptions;
                } else if (method.isSearchQuery) {
                    options = searchOptions;
                }
                apiMethod.call(terapeak, options, function(err, result, meta) {
                    if (method.name === 'GetResearchTrends') {
                        debugger;
                    }
                    assert(null === err, 'Should not call back with errors');
                    if (method.isTrendQuery) {
                        assert(0 < result.Day.length, 'Results should contain at least one day');
                        assert.equal(24, result.Day[0].Hour.length, 'Day results should contain 24 hourly results');
                    } else if (method.name === 'GetResearchResults') {
                        // GetResearchResults is a bit special:
                        assert(parseInt(result.ItemsOffered, 10) >= parseInt(result.ItemsSold), 'More items should be offered than sold.');
                    } else {
                        assert(0 < result.length, 'Results should contain multiple values.');
                    }
                    done();
                });
            });
        });
    });
});

