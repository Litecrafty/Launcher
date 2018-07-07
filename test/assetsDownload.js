const assert = require('assert')

describe('AssetsDownload', function() {
    describe('#getVersionsList()', function() {
        it('should return an array with version list', async function() {
            const AssetsDownload = require('../resources/js/assetsDownload')
            const versionList = await AssetsDownload.getVersionsList()

            // Check if defined
            assert(versionList)

            // Check if returned value is array
            assert(Array.isArray(versionList.versions))
        })
    })
})
