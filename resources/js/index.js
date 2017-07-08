const remote = require('electron').remote;

window.onload = function() {
  document.getElementById("minimize").addEventListener("click", function (e) {
      remote.getCurrentWindow().minimize();
  });

  document.getElementById("close").addEventListener("click", function (e) {
      remote.getCurrentWindow().close();
  });
}
