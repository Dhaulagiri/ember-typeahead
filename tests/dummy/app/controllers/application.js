import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  model: computed(function() {
    return [{ value: "one", label: "Einz" }, { value: "two", label: "Zwei" }];
  })
});
