/* eslint-disable no-console */

const $ = require('jquery')
const {
    remote
} = require('electron')
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

function dropdownProfile() {
    if (document.getElementById('profileDropdown')) {
        document.getElementById('profileDropdown').classList.toggle('show')
        if (document.getElementById('profileDropdown').classList.contains('show')) {
            document.getElementById('profile-btn').classList.add('active')
        } else {
            document.getElementById('profile-btn').classList.remove('active')
        }
    }
}

$(document).on('click', (event) => {
    if (!event.target.matches('#language-btn')) {
        let openDropdown = document.getElementById('languageDropdown')
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show')
            document.getElementById('language-btn').classList.remove('active')
        }
    }
    if (!event.target.matches('#profile-btn')) {
        let openDropdown = document.getElementById('profileDropdown')
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show')
            document.getElementById('profile-btn').classList.remove('active')
        }
    }
})

$(document).ready(() => {
    // Register 'future' events
    let body = $('body')
    body.on('click', 'a#language-btn', dropdownList)
    body.on('click', 'a#profile-btn', dropdownProfile)
    body.on('submit', '#login-form', doLogin)
    body.on('click', '#minimize', () => {
        remote.getCurrentWindow().minimize()
    })
    body.on('click', '#close', () => {
        remote.getCurrentWindow().close()
    })

    body.on('webkitAnimationEnd oanimationend msAnimationEnd animationend', '#login-form', function () {
        $('#login-form').delay(200).removeClass('ahashakeheartache')
    })

    checkInternet((isConnected) => {
        if (config.get('accessToken')) {
            console.log('accessToken found!')
            if (isConnected) {
                ygg.validate(config.get('accessToken'), (valid) => {
                    if (!valid) {
                        config.set('accessToken', '')
                        config.set('clientToken', '')
                        config.set('availableProfiles', [{}])
                        config.set('selectedProfile', '')
                        requestContent('login.pug')
                        window.setTimeout(() => {
                            $('#user').val(config.get('username'))
                        }, 185)
                    } else {
                        requestContent('main.pug')
                    }
                    console.log(valid)
                })
            } else {
                console.log('You are offline!')
                requestContent('main.pug')
            }
        } else {
            console.log('No accessToken found, returning to login screen')
            requestContent('login.pug')
            if (config.get('username')) {
                window.setTimeout(() => {
                    $('#user').val(config.get('username'))
                }, 120)
            }
        }
    })

    function requestContent(file) {
        history.pushState(null, null, file)
        $.ajax({
            url: file,
            success: (data) => {
                $('.content').html($(data).find('.content').addBack('.content').children())
            }
        })
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
        }, (err, data) => {
            user.prop('disabled', false)
            password.prop('disabled', false)

            if (err) {
                console.error(err)
                $('#login-form').addClass('ahashakeheartache')
                return
            }
            config.set('accessToken', data.accessToken)
            config.set('clientToken', data.clientToken)
            config.set('username', user.val())

            config.set('availableProfiles', data.availableProfiles)
            config.set('selectedProfile', data.selectedProfile)
            console.log('Logged in successfully!')
            requestContent('main.pug')
        })
    }

    function checkInternet(cb) {
        require('dns').lookup('minecraft.net', (err) => {
            if (err && err.code === 'ENOTFOUND') {
                cb(false)
            } else {
                cb(true)
            }
        })
    }

    translate()
})

$(window).on('beforeunload', (e) => {
    e.returnValue = false
    remote.app.relaunch()
    remote.getCurrentWindow().close()
})
