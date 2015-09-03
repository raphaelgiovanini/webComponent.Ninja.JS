this.Ninja.module('$webComponent', [
  
  '$apply',
  '$concat',
  '$curry',
  '$event',
  '$split'

], function ($apply, $concat, $curry, $event, $split) {
  
  function stub() {}

  return function (name, description) {
    
    function hookEvent(root, method) {
      for (var key in description.events || {}) {
        $apply($event((root.shadowRoot || root))[method], $concat($split(key, ' '), [description.events[key]]));
      }
    }
    
    function mixin(root) {
      for (var name in (description.prototype || {})) {
        root[name] = description.prototype[name].bind(null, root);
      }
    }
    
    function render(root, html) {
      hookEvent(root, 'off');
      ((root.createShadowRoot && root.createShadowRoot()) || root).innerHTML = html;
      hookEvent(root, 'on');
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
            mixin(this), (description.created || stub)(this);
          }
        },
        
        detachedCallback: {
          value: function () {
            hookEvent(this, 'off'), (description.detached || stub)(this);
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