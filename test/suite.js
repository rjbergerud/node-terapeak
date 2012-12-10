// Terapeak tests

var assert = require('assert');
var _ = require('underscore');
var Terapeak = require('../terapeak');
var docs = require('../api.json');

var apiKey = process.env.TERAPEAK_KEY ;
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

var searchByCategoryOptions = {
    SearchQuery: {
        CategoryID: '171485'
    }
};

var sellerSearchOptions = {
    SearchQuery: {
        CategoryLimit: [
            {
                CategoryID: '171485'
            }
        ],
        SellerFilters: {
            Seller: 'gazelle-store',
            CountryFilters: {
                Country: 1
            }
        }
    }
};

var productOptions = {
    ProductQuery: {
        Keywords: 'iPad 2',
        Categories: [
            {
                CategoryID: '171485'
            }
        ]
    }
};

var priceResearchOptions = {
    QueryKeywords: 'iPad 2',
    IncludeDailyStatistics: true,
    ResearchPeriod: 10
};

var itemOptions = {
    SearchQuery: {
        ItemID: 1234,
        TransactionID: 1234,
        Date: '1/1/2000'
    }
};

var mediaHotListOptions = {
    HotList: {
        Media: "dvd"
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
            if (method.excludeFromTest) {
                it('is excluded from testing because ' + method.excludeFromTestReason);
                return;
            }
            if (method.restricted && !restrictedApi) {
                it('can only best tested with a restricted api key');
                return;
            }
            it('should return appropriate results without error', function(done) {
                this.timeout(100000); // set a high timeout, as terapeak is sometimes a bit slow to respond.
                var options = method.testInput;
                if (!options) {
                    if (method.isCategoryQuery) {
                        options = categoryOptions;
                    } else if (method.isSearchQuery) {
                        options = searchOptions;
                    } else if (method.isProductCategory) {
                        options = productOptions;
                    } else if (method.isMediaHotListQuery) {
                        options = mediaHotListOptions;
                    } else if (method.isSellerSearchQuery) {
                        options = sellerSearchOptions;
                    } else if (method.isSearchByCategoryQuery) {
                        options = searchByCategoryOptions;
                    } else if (method.isPriceResearchQuery) {
                        options = priceResearchOptions;
                    } else if (method.isItemQuery) {
                        options = itemOptions;
                    } else {
                        options = {};
                    }
                }
                apiMethod.call(terapeak, options, function(err, result, meta) {
                    
                    assert(null === err, err);
                    if (method.isTrendQuery) {
                        assert(0 < result.Day.length, 'Results should contain at least one day');
                        assert.equal(24, result.Day[0].Hour.length, 'Day results should contain 24 hourly results');
                    } else if (method.name === 'GetResearchResults') {
                        // GetResearchResults is a bit special:
                        assert(parseInt(result.ItemsOffered, 10) >= parseInt(result.ItemsSold), 'More items should be offered than sold.');
                    } else if (method.name === 'GetSellerResearchResults') {
                        assert(null !== result.Statistics, 'Seller results should include summary statistics.');
                    } else if (method.isPriceResearchQuery) {
                        assert(null !== result.Statistics, 'Price research results should include summary statistics.');
                        if (options.IncludeDailyStatistics) {
                            assert(null !== result.DailyStatistics, 'Price research results should include daily statistics as requested.');
                        }
                    } else if (method.name === 'GetTitleBuilderResults') {
                        assert(null !== result.Totals, 'Title builder results include summary totals');
                        assert(0 < result.Words.length, 'Title builder results include a non-empty set of words');
                    } else if (method.isItemQuery) {
                        assert(result.Title.length > 0, 'Item has valid title');
                    } else if (method.name === 'GetSystemDates') {
                        // GetResearchResults is a bit special:
                        assert(Date.parse(result.StartDate) < Date.parse(result.EndDate), 'System end date should be greater than system start date.');
                    } else {
                        assert(0 < result.length, 'Results should contain multiple values.');
                    }
                    done();
                });
            });
        });
    });
});

