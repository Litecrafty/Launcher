/* eslint-disable no-console */

const $ = require('jquery')
const {remote} = require('electron')
const config = require('../config.js')
const ygg = require('litecraft-yggdrasil')({})

const dictionary = {
    'help': {
        'en': 'Help',
        'es': 'Ayuda',
        'ess': 'Ayudita'
    }
}
const langs = ['en', 'es', 'ess']
let current_lang_index = 0
let current_lang = langs[current_lang_index]

window.change_lang = function () {
    current_lang_index = ++current_lang_index % 3
    current_lang = langs[current_lang_index]
    translate()
}

function translate() {
    $('[data-translate]').each(function () {
        let key = $(this).data('translate')
        $(this).html(dictionary[key][current_lang] || 'N/A')
    })
}

function dropdownList() {
    if (document.getElementById('languageDropdown')) {
        document.getElementById('languageDropdown').classList.toggle('show')
        if (document.getElementById('languageDropdown').classList.contains('show')) {
            document.getElementById('language-btn').classList.add('active')
        } else {
            document.getElementById('language-btn').classList.remove('active')
        }
    }
}

window.onclick = function (event) {
    if (!event.target.matches('.abutton')) {
        let dropdowns = document.getElementsByClassName('dropdown-content')
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i]
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show')
                document.getElementById('language-btn').classList.remove('active')
            }
        }
    }
}

window.onload = function () {
    $('.content').bind('contentChanged', function () {
        if ($('.content').length > 0) {
            window.setTimeout(function () {
                $('#version').text(remote.app.getVersion())

                translate()
            }, 185)
        }
    })

    // Register 'future' events
    let body = $('body')
    body.on('click', '#version', dropdownList)
    body.on('submit', '#login-form', doLogin)

    document.getElementById('minimize').addEventListener('click', function () {
        remote.getCurrentWindow().minimize()
    })

    document.getElementById('close').addEventListener('click', function () {
        remote.getCurrentWindow().close()
    })

    checkInternet(function (isConnected) {
        if (config.get('accessToken')) {
            console.log('accessToken found!')
            if (isConnected) {
                ygg.validate(config.get('accessToken'), function (valid) {
                    if (!valid) {
                        config.delete('accessToken')
                        requestContent('login.pug')
                    } else {
                        requestContent('main.pug')
                    }
                    console.log(valid)
                })
            } else {
                requestContent('main.pug')
                console.log('Offline!')
            }
        } else {
            console.log('No accessToken found, returning to login screen')
            requestContent('login.pug')
        }
    })

    function requestContent(file) {
        history.pushState(null, null, file)
        $('.content').load(file + ' .content-data').triggerHandler('contentChanged')

        window.setTimeout(function () {
            if (document.getElementById('version')) {
                document.getElementById('version').innerHTML = remote.app.getVersion()
                document.getElementById('language-btn').addEventListener('click', function () {
                    dropdownList()
                })
            }
            translate()
        }, 47)
    }

    function doLogin(event) {
        event.preventDefault()

        console.log('Trying to login...')

        let user = $('#user')
        let password = $('#password')

        user.prop('disabled', true)
        password.prop('disabled', true)

        ygg.auth({
            user: user.val(),
            pass: password.val()
        }, function (err, data) {
            user.prop('disabled', false)
            password.prop('disabled', false)

            if (err) {
                console.log(err)
                return
            }
            requestContent('main.pug')
            config.set('accessToken', data.accessToken)
            config.set('clientToken', data.clientToken)

            config.set('availableProfiles', data.availableProfiles)
            config.set('selectedProfile', data.selectedProfile)
        })
    }

    function checkInternet(cb) {
        require('dns').lookup('minecraft.net', function (err) {
            if (err && err.code === 'ENOTFOUND') {
                cb(false)
            } else {
                cb(true)
            }
        })
    }

    translate()
}

window.onbeforeunload = (e) => {
    e.returnValue = false
    remote.app.relaunch()
    remote.getCurrentWindow().close()
}