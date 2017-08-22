const remote = require('electron').remote

var dictionary = {
	'help': {
		'en': 'Help',
		'es': 'Ayuda',
		'ess': 'Ayudita',
	}
}
var langs = ['en', 'es', 'ess']
var current_lang_index = 0
var current_lang = langs[current_lang_index]

window.change_lang = function() {
	current_lang_index = ++current_lang_index % 3
	current_lang = langs[current_lang_index]
	translate()
}

function translate() {
	$('[data-translate]').each(function(){
		var key = $(this).data('translate')
		$(this).html(dictionary[key][current_lang] || 'N/A')
	})
}

function dropdownList() {
	document.getElementById('myDropdown').classList.toggle('show')
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {
		var dropdowns = document.getElementsByClassName('dropdown-content')
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i]
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show')
			}
		}
	}
}

window.onload = function() {
	document.getElementById('version').innerHTML = remote.app.getVersion()
	document.getElementById('minimize').addEventListener('click', function() {
		remote.getCurrentWindow().minimize()
	})

	document.getElementById('close').addEventListener('click', function() {
		remote.getCurrentWindow().close()
	})
	translate()
}
