/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()

  var $autocompleteInput = document.querySelector('[data-module=autocomplete]')

  if ($autocompleteInput) {
    var autocomplete = new window.GOVUK.Modules.Autocomplete()
    autocomplete.start($autocompleteInput)
  }
})
