import Ember from 'ember';

export default Ember.Controller.extend({
  model: Ember.computed(function() {
    return [{ value: "one", label: "Einz" }, { value: "two", label: "Zwei" }];
  })
});
