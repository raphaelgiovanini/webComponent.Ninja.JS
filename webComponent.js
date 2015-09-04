this.Ninja.module('$webComponent', [
  
  '$apply',
  '$concat',
  '$curry',
  '$event',
  '$split'

], function ($apply, $concat, $curry, $event, $split) {
  
  function stub() {}

  return function (name, description) {
    
    function eventDelegation(root) {
      for (var key in description.events || {}) {
        $apply($event((root.shadowRoot || root)).delegation, $concat($split(key, ' '), [description.events[key].bind(null, root)]));
      }
    }
    
    function merge(root) {
      for (var name in (description.prototype || {})) {
        root[name] = description.prototype[name].bind(null, root);
      }
    }
    
    function render(root, html) {
      root.shadowRoot.innerHTML = html;
    }
    
    document.registerElement(name, {
      prototype: Object.create(HTMLElement.prototype, {
      
        attachedCallback: {
          value: function () {
            (description.attached || stub)(this);
          }
        },
      
        attributeChangedCallback: {
          value: function (attrName, oldValue, newValue) {
            ((description.attributes || {})[attrName] || stub)(this, oldValue, newValue);
          }
        },
        
        createdCallback: {
          value: function () {
            this.createShadowRoot(), eventDelegation(this), merge(this), (description.created || stub)(this);
          }
        },
        
        detachedCallback: {
          value: function () {
            (description.detached || stub)(this);
          }
        },
        
        setState: {
          value: function (data) {
            (description.template || stub)(this, data, $curry(render)(this));
          }
        }
        
      })
      
    });
  };

});