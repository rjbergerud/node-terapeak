// Terapeak tests

var assert = require('assert');
var _ = require('underscore');
var Terapeak = require('../terapeak');

var apiKey = process.env.TERAPEAK_KEY || 'j45nrc43wrheap4jwpf3v8mg';
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

describe('terapeak', function() {
    describe('#getCategorySellers()', function() {
        it('should call back with the requested list of category sellers', function(done) {
            this.timeout(10000); // set a high timeout, as terapeak is sometimes a bit slow to respond.
            terapeak.getCategorySellers(categoryOptions, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert.equal(meta.category_id, categoryOptions.CategoryQuery.Categories[0].CategoryID, 'Results should be for requested category id');
                assert(0 < result.length, 'Results should contain multiple sellers.');
                done();
            });
        });
    });
    describe('#getCategoryStructure()', function() {
        it('should call back with the requested category structure', function(done) {
            this.timeout(10000);
            terapeak.getCategoryStructure(categoryOptions, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(0 < result.length, 'Results should contain multiple categories');
                done();
            });
        });
    });
    describe('#getCategoryTopTitles()', function() {
        it('should call back with the top titles in the requested category', function(done) {
            this.timeout(10000);
            terapeak.getCategoryTopTitles(categoryOptions, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(0 < result.length, 'Results should contain multiple top titles');
                done();
            });
        });
    });
    describe('#getCategoryTrends()', function() {
        it('should call back with the trends in the requested category', function(done) {
            this.timeout(10000);
            var options = _.defaults({}, categoryOptions);
            options.CategoryQuery.TrendValues = {
                ReturnAll: true,
                ReturnListings: true
            };
            terapeak.getCategoryTrends(options, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(0 < result.length, 'Results should contain multiple trend data points');
                done();
            });
        });
    });
    describe('#getCategoryHotList()', function() {
        it('should call back with the hot categories', function(done) {
            this.timeout(10000);
            terapeak.getCategoryHotList({}, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(0 < result.length, 'Results should contain multiple hot categories');
                done();
            });
        });
    });
    describe('#getTopTitles()', function() {
        it('should call back with the top titles in the requested category', function(done) {
            this.timeout(10000);
            terapeak.getTopTitles({}, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(0 < result.length, 'Results should contain multiple top titles');
                done();
            });
        });
    });
    describe('#getResearchResults()', function() {
        it.only('should call back with research results', function(done) {
            this.timeout(10000);
            var options = {
                SearchQuery: {
                    Keywords: 'iPad 2',
                    CategoryLimit: [
                        {
                            CategoryID: '171485'
                        }
                    ]
                }
            };
            terapeak.getResearchResults(options, function(err, result, meta) {
                assert(null === err, 'Should not call back with errors');
                assert(parseInt(result.ItemsOffered, 10) >= parseInt(result.ItemsSold), 'More items should be offered than sold.');
                done();
            });
        })
    })
});

