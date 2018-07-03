/*global remote versions*/
/*eslint no-undef: "error"*/
'use strict'

$(document).ready(() => {
    $('#version').text(remote.app.getVersion())
    $('.selected-version').text(versions.getSelectedVersion() + ' ' + versions.getSelectedVersionWithDetails().type.toUpperCase())
})
