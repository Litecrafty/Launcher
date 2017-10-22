var img = new Image(125, 125);
img.src = 'https://minotar.net/armor/bust/' + config.get('selectedProfile').name + '/125.png'
if (img.complete) {
  $('.avatar img').attr("src", img.src)
} else {
  img.onload = function() {
    $('.avatar img').attr("src", img.src)
  }
}
