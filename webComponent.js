this.Ninja.module('$webComponent', [
  
  '$always',
  '$apply',
  '$concat',
  '$curry',
  '$event',
  '$split'

], function ($always, $apply, $concat, $curry, $event, $split) {
  
  return function (name, description) {
    
    function eventDelegation(root) {
      for (var key in description.events || {}) {
        $apply($event(root.shadowRoot).delegation, $concat($split(key, ' '), [description.events[key].bind(null, root)]));
      }
    }
    
    function merge(root) {
      for (var name in (description.prototype || {})) {
        root[name] = description.prototype[name].bind(null, root);
      }
    }
    
    document.registerElement(name, {
      prototype: Object.create(HTMLElement.prototype, {
      
        attachedCallback: {
          value: function () {
            (description.attached || $always())(this);
          }
        },
      
        attributeChangedCallback: {
          value: function (attrName, oldValue, newValue) {
            ((description.attributes || {})[attrName] || $always())(this, oldValue, newValue);
          }
        },
        
        createdCallback: {
          value: function () {
            merge(this), this.createShadowRoot(), eventDelegation(this), (description.created || $always())(this);
          }
        },
        
        detachedCallback: {
          value: function () {
            (description.detached || $always())(this);
          }
        },
        
        setState: {
          value: function (data) {
            (description.template || $always())(this, this.state = data);
          }
        }
        
      })
      
    });
  };

});
