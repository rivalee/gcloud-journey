window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  function Autocomplete () { }

  Autocomplete.prototype.start = function ($module) {
    this.$module = $module
    this.initAutoCompleteSearchTopics()
  }

  Autocomplete.prototype.initAutoCompleteSearchTopics = function () {
    var $input = this.$module.querySelector('input')
    var $module = this.$module
    var millerColumns = document.querySelector('miller-columns')
    var topics = millerColumns.taxonomy.flattenedTopics

    var topicSuggestions = []

    topics.forEach(function (topic) {
      topicSuggestions.push({
        topic: topic,
        highlightedTopicName: topic.topicName.replace(/<\/?mark>/gm, ''), // strip existing <mark> tags
        breadcrumbs: topic.topicNames
      })
    })

    if (!topicSuggestions) {
      return
    }

    new window.accessibleAutocomplete({ // eslint-disable-line no-new, new-cap
      id: $input.id,
      name: $input.name,
      element: this.$module,
      minLength: 3,
      autoselect: false,
      source: function (query, syncResults) {
        var results = topicSuggestions
        var resultMatcher = function (result) {
          var topicName = result.topic.topicName
          var indexOf = topicName.toLowerCase().indexOf(query.toLowerCase())
          var resultContainsQuery = indexOf !== -1
          if (resultContainsQuery) {
            // Wrap query in <mark> tags
            var queryRegex = new RegExp('(' + query + ')', 'ig')
            result.highlightedTopicName = topicName.replace(queryRegex, '<mark>$1</mark>')
          }
          return resultContainsQuery
        }

        syncResults(query ? results.filter(resultMatcher) : [])
      },
      templates: {
        inputValue: function (result) {
          return ''
        },
        suggestion: function (result) {
          var suggestionsBreadcrumbs
          if (result && result.breadcrumbs) {
            result.breadcrumbs[result.breadcrumbs.length - 1] = result.highlightedTopicName
            suggestionsBreadcrumbs = result.breadcrumbs.join(' › ')
          }
          return suggestionsBreadcrumbs
        }
      },
      onConfirm: function (result) {
        if (result && !result.topic.selected && !result.topic.selectedChildren.length) {
          Autocomplete.prototype.triggerEvent($module, 'search-topic', result.topic)
          millerColumns.taxonomy.topicClicked(result.topic)
        }
      }
    })

    $input.parentNode.removeChild($input)
  }

  Autocomplete.prototype.dropdownArrow = function (config) {
    return '<svg class="' + config.className + '" style="top: 8px;" viewBox="0 0 512 512" ><path d="M256,298.3L256,298.3L256,298.3l174.2-167.2c4.3-4.2,11.4-4.1,15.8,0.2l30.6,29.9c4.4,4.3,4.5,11.3,0.2,15.5L264.1,380.9  c-2.2,2.2-5.2,3.2-8.1,3c-3,0.1-5.9-0.9-8.1-3L35.2,176.7c-4.3-4.2-4.2-11.2,0.2-15.5L66,131.3c4.4-4.3,11.5-4.4,15.8-0.2L256,298.3  z"/></svg>'
  }

  Autocomplete.prototype.triggerEvent = function (element, eventName, detail) {
    var params = { bubbles: true, cancelable: true, detail: detail || null }
    var event

    if (typeof window.CustomEvent === 'function') {
      event = new window.CustomEvent(eventName, params)
    } else {
      event = document.createEvent('CustomEvent')
      event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail)
    }

    element.dispatchEvent(event)
  }

  Modules.Autocomplete = Autocomplete
})(window.GOVUK.Modules)
