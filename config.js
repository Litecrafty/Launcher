'use strict'

const Config = require('electron-config')

module.exports = new Config({
    defaults: {
        accessToken: '',
        username: '',
        clientToken: '',
        availableProfiles: [{}],
        selectedProfile: '',
        lastUpdated: new Date() - (1000 * 60 * 24), // Mark version cache as invalid
        versions: {},
        selectedVersion: null
    }
})
