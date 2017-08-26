'use strict'

const Config = require('electron-config')

module.exports = new Config({
    defaults: {
        accessToken: '',
        username: '',
        clientToken: '',
        availableProfiles: [{}],
        selectedProfile: ''
    }
})
