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

    config.get('versions').versions.filter(function (v) {
        return v.version == latest
    })
}

const selectedVersion = function () {
    if (!config.get('selectedVersion')) {
        config.set('selectedVersion', getLatestVersion())
    }
    return config.get('selectedVersion')
}

module.exports = { updateVersionCache, getLatestVersion, selectedVersion }