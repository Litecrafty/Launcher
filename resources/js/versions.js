'use strict'

const config = require('../../config.js')
const $ = require('jquery')

const updateVersionCache = function () {
    if (new Date() - config.get('lastUpdated') > 1000 * 60 * 10) {
        $.get('https://litecrafty.github.io/website/versions.json', function (data) {
            config.set('versions', data)
        })
    }
}

const getLatestVersion = function () {
    updateVersionCache()
    //TODO: Allow to select alpha...
    const latest = config.get('versions').latest[0]

    return config.get('versions').versions.filter(function (v) {
        return v.version == latest
    })[0]
}

const getSelectedVersion = function () {
    if (!config.get('selectedVersion')) {
        config.set('selectedVersion', config.get('versions').latest[0])
    }
    return config.get('selectedVersion')
}

const getSelectedVersionWithDetails = function () {
    return config.get('versions').versions.filter(function (v) {
        return v.version == getSelectedVersion()
    })[0]
}

module.exports = { updateVersionCache, getLatestVersion, getSelectedVersion, getSelectedVersionWithDetails }
