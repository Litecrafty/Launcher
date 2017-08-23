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
    document.getElementById('languageDropdown').classList.toggle('show')
    if (document.getElementById('languageDropdown').classList.contains('show')) {
        document.getElementById('language-btn').classList.add('active')
    } else {
        document.getElementById('language-btn').classList.remove('active')
    }
}

// Close the dropdown menu if the user clicks outside of it
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
    document.getElementById('minimize').addEventListener('click', function () {
        remote.getCurrentWindow().minimize()
    })

    document.getElementById('close').addEventListener('click', function () {
        remote.getCurrentWindow().close()
    })

    function requestContent(file) {
        $('.content').load(file + ' .content').triggerHandler('contentChanged')
    }

    if (config.get('accessToken')) {
        console.log('accessToken found!')
        checkInternet(function (isConnected) {
            if (isConnected) {
                ygg.validate(config.get('accessToken'), function (valid) {
                    if (!valid) {
                        history.pushState(null, null, 'login.pug')
                        requestContent('login.pug')
                    } else {
                        history.pushState(null, null, 'main.pug')
                        requestContent('main.pug')
                    }
                    console.log(valid)
                })
            } else {
                history.pushState(null, null, 'main.pug')
                requestContent('main.pug')
                console.log('Offline!')
            }
        })
    } else {
        history.pushState(null, null, 'login.pug')
        requestContent('login.pug')
    }

    function checkInternet(cb) {
        require('dns').lookup('google.com', function (err) {
            if (err && err.code === 'ENOTFOUND') {
                cb(false)
            } else {
                cb(true)
            }
        })
    }

    $('.content').bind('contentChanged', function () {
        if ($('.content').length > 0) {
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
    })
    translate()
}