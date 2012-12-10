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
                this.timeout(10000); // set a high timeout, as terapeak is sometimes a bit slow to respond.

                var options = method.sampleInput || {};

                apiMethod.call(terapeak, options, function(err, result, meta) {

                    assert(null === err, err);

                    switch (method.name) {
                        case 'GetResearchResults':
                            assert(parseInt(result.ItemsOffered, 10) >= parseInt(result.ItemsSold), 
                                'More items should be offered than sold.');
                            break;
                        case 'GetSellerResearchResults':
                            assert(null !== result.Statistics, 
                                'Seller results should include summary statistics.');
                            break;
                        case 'GetPriceResearch':
                            assert(null !== result.Statistics, 
                                'Price research results should include summary statistics.');
                            if (options.IncludeDailyStatistics) {
                                assert(null !== result.DailyStatistics, 
                                    'Price research results should include daily statistics as requested.');
                            }
                            break;
                        case 'GetTitleBuilderResults':
                            assert(null !== result.Totals, 
                                'Title builder results include summary totals');
                            assert(0 < result.Words.length, 
                                'Title builder results include a non-empty set of words');
                            break;
                        case 'GetSingleItemDetails':
                            assert(result.Title.length > 0, 
                                'Item has valid title');
                            break;
                        case 'GetSystemDates':
                            assert(Date.parse(result.StartDate) < Date.parse(result.EndDate), 
                                'System end date should be greater than system start date.');    
                            break;
                        case 'GetResearchTrends':
                        case 'GetSellerResearchTrends':
                            assert(0 < result.Day.length, 
                                'Results should contain at least one day');
                            assert.equal(24, result.Day[0].Hour.length, 
                                'Day results should contain 24 hourly results');
                            break;
                        default:
                            assert(0 < result.length, 
                                'Results should contain multiple values.');
                            break;
                    }
                    done();
                });
            });
        });
    });
});

