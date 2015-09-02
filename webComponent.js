this.Ninja.module('$webComponent', [
  
  '$apply',
  '$concat',
  '$event',
  '$fileRequest',
  '$keys',
  '$memoize',
  '$reduce',
  '$split',
  '$template'

], function ($apply, $concat, $event, $fileRequest, $keys, $memoize, $reduce, $split, $template) {

  return function (name, description) {
    
    var getAttribute = $memoize(function (name) {
      return (description.attributes || {})[name] || stub;
    });
    
    var fileTemplate;
    
    function hookEvent(root, method) {
      for (var key in description.events) {
        $apply($event((root.shadowRoot || root))[method], $concat($split(key, ' '), [description.events[key]]));
      }
    }
    
    function mixin(root) {
      for (var name in (description.prototype || {})) {
        root[name] = description.prototype[name].bind(null, root);
      }
    }
    
    function stub() {
      return {};
    }
    
    document.registerElement(name, {
      prototype: Object.create(HTMLElement.prototype, {
      
        attachedCallback: {
          value: function () {
            
            var that = this;
            
            $fileRequest(description.templateUrl, function (template) {
              
              fileTemplate = template;
              
              that.createShadowRoot && (that.createShadowRoot());
              that.setState((description.getInitialState || stub)(that));
              
              (description.attached || stub)(that);
              
            });
            
          }
        },
      
        attributeChangedCallback: {
          value: function (attrName, oldValue, newValue) {
            getAttribute(attrName)(this, oldValue, newValue);
          }
        },
        
        createdCallback: {
          value: function () {
            mixin(this), (description.created || stub)(this);
          }
        },
        
        detachedCallback: {
          value: function () {
            (description.detached || stub)(this);
          }
        },
        
        setState: {
          value: function (data) {
            hookEvent(this, 'off');
            (this.shadowRoot || this).innerHTML = $template(fileTemplate, data);
            hookEvent(this, 'on');
          }
        }
        
      })
      
    });
  };

});