# Ember-typeahead

`ember-typeahead` is an ember-cli addon that wraps up the [typeahead.js](https://twitter.github.io/typeahead.js/) and [Tokenfield for Boostrap](http://sliptree.github.io/bootstrap-tokenfield/) plugins and exposes them through a single ember component.

## Usage

### Typeahead

The default usage of the `type-ahead` component gives the consumer a typeahead.js search:

```handlebars
  {{type-ahead
    id="typeahead-id"
    content=contentArray
    displayKey="name"
    valueToken="name"
    placeholder="Search by name"
    class="form-control"
    selectOnEnter=true
    suggestionTemplate=suggestionTemplate
    emptyTemplate=emptyTemplate
    limit=numberofresultstodisplay
    onSelectAction="ActionToRunOnSelect"}}
```

### Tokenized

Switching the typeahead from a typeahead.js function to a Tokenfield for Bootstrap function is as simple as passing `tokenized=true` into the component as well as setting the `value` property to a comma-delimited string of values that will be bound as the tokenized list of items selected in the input.

 ```handlebars
  {{type-ahead
    id="typeahead-id"
    tokenized=true
    value=selectedApps
    content=contentArray
    displayKey="name"
    valueToken="name"
    placeholder="Search by name"
    class="form-control"
    suggestionTemplate=suggestionTemplate
    emptyTemplate=emptyTemplate}}
```

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Further Reading / Useful Links

* The typeahead.js component is based heavily on the [ember-cli-twitter-typeahead](https://github.com/Dhaulagiri/ember-cli-twitter-typeahead) addon
* [Tokenfield for Boostrap](http://sliptree.github.io/bootstrap-tokenfield/)
* [typeahead.js](https://twitter.github.io/typeahead.js/)
