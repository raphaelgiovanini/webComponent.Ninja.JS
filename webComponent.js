this.Ninja.module('$component', [
  
  '$keys',
  '$fileRequest',
  '$memoize',
  '$reduce',
  '$template'

], function ($keys, $fileRequest, $memoize, $reduce, $template) {

  return function (name, description) {
    
    var getAttribute = $memoize(function (name) {
      return (description.attributes || {})[name] || stub;
    });
    
    var fileTemplate;
    
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
            mixin(this);
            (description.created || stub)(this);
          }
        },
        
        detachedCallback: {
          value: function () {
            (description.detached || stub)(this);
          }
        },
        
        setState: {
          value: function (data) {
            
            function event(callback, e) {
              callback(this, e.srcElement || e.target, e);
            }
            
            function hook(type, selector, callback, method) {
              [].slice.call((this.shadowRoot || this).querySelectorAll(selector)).forEach(function (item) {
                item[method](type, event.bind(this, callback), !1);
              }, this);
            }
            
            for (var key in description.events) {
              hook.apply(this, key.split(' ').concat([description.events[key], 'removeEventListener']));
            }
            
            (this.shadowRoot || this).innerHTML = $template(fileTemplate, data);
            
            for (var key in description.events) {
              hook.apply(this, key.split(' ').concat([description.events[key], 'addEventListener']));
            }
            
          }
        }
        
      })
      
    });
  };

});