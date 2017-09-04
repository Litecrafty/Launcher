/* eslint-disable no-console */

$(document).ready(() => {
    $('#version').text(remote.app.getVersion())
    translate()
})