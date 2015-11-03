angular.module('sgApp', [
  'ui.router',
  'ngAnimate',
  'colorpicker.module',
  'hljs',
  'LocalStorageModule',
  'oc.lazyLoad',
  'ngProgress',
  'rt.debounce',
  'duScroll'
])
  .value('duScrollOffset', 30)
  .config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "localStorageServiceProvider", "$ocLazyLoadProvider", function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider, $ocLazyLoadProvider) {
    var styleguideConfig = {};
    if (typeof window._styleguideConfig !== 'undefined') {
      styleguideConfig = window._styleguideConfig;
    }
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('app', {
        template: '<ui-view />',
        controller: 'AppCtrl',
        abstract: true
      })
      .state('app.index', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('app.index.section', {
        url: '/section/:section',
        templateUrl: 'views/sections.html',
        controller: 'SectionsCtrl',
        resolve: {
          loadLazyModule: ["$ocLazyLoad", function($ocLazyLoad) {
            loadModule($ocLazyLoad);
          }]
        }
      })
      .state('app.index.search', {
        url: '/search/:section',
        templateUrl: 'views/sections.html',
        controller: 'SectionsCtrl',
        resolve: {
          loadLazyModule: ["$ocLazyLoad", function($ocLazyLoad) {
            loadModule($ocLazyLoad);
          }]
        }
      })
      .state('app.index.overview', {
        url: '/',
        templateUrl: 'overview.html',
        controller: ["$rootScope", "Styleguide", function($rootScope, Styleguide) {
          $rootScope.currentSection = 'overview';
          // Update current reference to update the designer tool view
          $rootScope.currentReference.section = {
            header: 'Overview',
            reference: ''
          };

          $rootScope.$watch(function() {
            return Styleguide.config.data;
          }, function(newVal) {
            if (newVal) {
              $rootScope.pageTitle = newVal.title;
            }
          });
        }]
      })
      .state('app.index.variable', {
        url: '/variable/:variableName',
        templateUrl: 'views/variable-sections.html',
        controller: 'VariablesCtrl',
        resolve: {
          loadLazyModule: ["$ocLazyLoad", function($ocLazyLoad) {
            loadModule($ocLazyLoad);
          }]
        }
      })
      .state('app.fullscreen', {
        url: '/section/:section/fullscreen',
        templateUrl: 'views/element-fullscreen.html',
        controller: 'ElementCtrl',
        resolve: {
          loadLazyModule: ["$ocLazyLoad", function($ocLazyLoad) {
            loadModule($ocLazyLoad);
          }]
        }
      }).state('app.index.404', {
        url: '/:all',
        templateUrl: 'views/404.html'
      });

    function loadModule($ocLazyLoad) {
      if (window.filesConfig && window.filesConfig.length) {
        var moduleNames = [];
        angular.forEach(window.filesConfig, function(lazyLoadmodule) {
          moduleNames.push(lazyLoadmodule.name);
        });
        return $ocLazyLoad.load(moduleNames);
      }
    }

    $locationProvider.html5Mode(!styleguideConfig.disableHtml5Mode);
    localStorageServiceProvider.setPrefix('sgLs');

    $ocLazyLoadProvider.config({
      events: true,
      debug: true,
      modules: window.filesConfig
    });
  }])
  .factory('lodash', ['$window',
    function($window) {
      // Use both methods to access _ so it will work eventhough $window is mocked
      return $window._ || window._;
    }
  ])
  .run(["$rootScope", "$window", "lodash", function($rootScope, $window, lodash) {
    $rootScope.currentReference = {
      section: {
      }
    };

    // Create global throttled scorll
    function broadcastScrollEvent(event) {
      $rootScope.$broadcast('scroll', event);
    }
    // Some tests replace $window with a mock, make sure that we have real window
    if (typeof $window.addEventListener === 'function') {
      angular.element($window).bind('scroll', lodash.throttle(broadcastScrollEvent, 350));
    }
  }])
  .filter('addWrapper', ['Styleguide', function(Styleguide) {
    return function(html) {
      if (Styleguide.config && Styleguide.config.data && Styleguide.config.data.commonClass) {
        return '<sg-common-class-wrapper class="' + Styleguide.config.data.commonClass + '">' + html + '</sg-common-class-wrapper>';
      }
      return html;
    };
  }])
  // Trust modifier markup to be safe html
  .filter('unsafe', ['$sce', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  }])
  .filter('filterRelated', function() {
    return function(variables, sectionVariableNames) {
      var filtered = [];
      angular.forEach(variables, function(variable) {
        if (sectionVariableNames && sectionVariableNames.indexOf(variable.name) > -1) {
          filtered.push(variable);
        }
      });
      return filtered;
    };
  })
  // Replaces modifier markup's {$modifiers} with modifier's modifierClass
  .filter('setModifierClass', function() {
    return function(items, modifierClass) {
      if (items) {
        items = items.replace(/\{\$modifiers\}/g, modifierClass);
      }
      return items;
    };
  })
  // Replace $variables with values found in variables object
  .filter('setVariables', function() {
    return function(str, variables) {
      if (!str) {
        return '';
      }

      var sortedVariables;
      if (variables) {
        sortedVariables = variables.slice().sort(function(a, b) {
          return b.name.length - a.name.length;
        });
      }

      angular.forEach(sortedVariables, function(variable) {
        var cleanedValue = variable.value.replace(/\s*\!default$/, '');

        if (cleanedValue.match('\[\$\@]') !== null) {
          var varName = cleanedValue.substring(1);
          angular.forEach(sortedVariables, function(_var) {
            if (_var.name === varName) {
              cleanedValue = _var.value;
            }
          });
        }

        str = str.replace(new RegExp('\[\$\@]' + variable.name, 'g'), cleanedValue);
      });
      return str;
    };
  });

'use strict';

angular.module('sgApp')
  .controller('AppCtrl', ["$scope", "ngProgress", function($scope, ngProgress) {
    // ngProgress do not respect styles assigned via CSS if we do not pass empty parameters
    // See: https://github.com/VictorBjelkholm/ngProgress/issues/33
    ngProgress.height('');
    ngProgress.color('');

    // Scroll top when page is changed
    $scope.$on('$viewContentLoaded', function() {
      window.scrollTo(0, 0);
    });

    $scope.$on('progress start', function() {
      ngProgress.start();
    });

    $scope.$on('progress end', function() {
      ngProgress.complete();
    });

    // Reload styles when server notifies about the changes
    // Add cache buster to every stylesheet on the page forcing them to reload
    $scope.$on('styles changed', function() {
      var links = Array.prototype.slice.call(document.getElementsByTagName('link'));
      links.forEach(function(link) {
        if (typeof link === 'object' && link.getAttribute('type') === 'text/css' && link.getAttribute('data-noreload') === null) {
          link.href = link.href.split('?')[0] + '?id=' + new Date().getTime();
        }
      });
    });

    $scope.$on('socket connected', function() {
      console.log('Socket connection established');
    });

    $scope.$on('socket disconnected', function() {
      console.error('Socket connection dropped');
      ngProgress.reset();
    });

    $scope.$on('socket error', function(err) {
      console.error('Socket error:', err);
    });

  }]);

angular.module('sgApp')
  .controller('ElementCtrl', ["$scope", "$rootScope", "$stateParams", "$state", "Styleguide", "Variables", "$filter", "$location", function($scope, $rootScope, $stateParams, $state, Styleguide, Variables, $filter, $location) {

    var section = $stateParams.section.split('-'),
      reference = section[0],
      modifier = section[1];

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function() {
      updatePageData();
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function() {
      updatePageData();
    });

    function previousSection(sections, result) {
      var sec, i, m;
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier <= 1) {
          i = sections.indexOf(result[0]) - 1;
          for (i; i >= 0; i--) {
            sec = sections[i];
            if (sec.hasOwnProperty('modifiers')) {
              if (sec.modifiers.length > 0) {
                break;
              } else if (sec.hasOwnProperty('markup') && sec.markup) {
                return sec.reference;
              }
            }
          }
          if (sec.hasOwnProperty('modifiers') && sec.modifiers.length > 0) {
            m = sec.modifiers.length + 1;
          } else {
            return false;
          }
        }
        return sec.reference + '-' + (parseInt(m) - 1);
      }
    }

    function nextSection(sections, result) {
      var sec, i, m;
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier >= sec.modifiers.length) {
          i = sections.indexOf(result[0]) + 1;
          for (i; i < sections.length; i++) {
            sec = sections[i];
            if (sec.hasOwnProperty('modifiers')) {
              if (sec.modifiers.length > 0) {
                m = 0;
                break;
              } else if (sec.hasOwnProperty('markup') && sec.markup) {
                return sec.reference;
              }
            }
          }
        }
        if (sec.modifiers.length === 0) {
          return false;
        }
        return sec.reference + '-' + (parseInt(m) + 1);
      }
    }

    function getSectionMarkup(section) {
      return $filter('setVariables')($filter('setModifierClass')(section.renderMarkup, section.className), $scope.variables);
    }

    function updatePageData() {
      var recursive = $location.search().recursive,
        separator = '<br>',
        sections, result, element, markup, modifierStr;

      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(section) {
        if (reference === 'all') {
          return true;
        }
        if (recursive) {
          return new RegExp('^' + reference + '(\\D|$)').test(section.reference);
        } else {
          return reference === section.reference;
        }
      });

      if (result.length > 0) {
        element = result[0];

        // Set page title
        if (Styleguide.config.data) {
          modifierStr = modifier ? '-' + modifier.toString() : '';
          $rootScope.pageTitle = element.reference + modifierStr + ' ' + element.header + ' - ' + Styleguide.config.data.title;
        }

        // Set the actual page content
        $scope.previousSection = previousSection(sections, result);
        $scope.nextSection = nextSection(sections, result);
        $scope.variables = Variables.variables;

        // Collect every component markup when using recursive mode
        if (recursive) {
          markup = '';
          angular.forEach(result, function(section) {
            if (section.modifiers && section.modifiers.length > 0) {
              // If section contains modifier, render every modifier
              angular.forEach(section.modifiers, function(modifier) {
                markup += getSectionMarkup(modifier) + separator;
              });
            } else {
              // Otherwise just render the element
              markup += getSectionMarkup(section) + separator;
            }
          });
        } else {
          // Select correct modifier element if one is defined
          if (modifier) {
            element = element.modifiers[modifier - 1];
          }
          markup = getSectionMarkup(element);
        }

        $scope.section = element;
        $scope.markup = markup;
      }
    }
  }]);

'use strict';

angular.module('sgApp')
  .controller('MainCtrl', ["$scope", "$location", "$state", "Styleguide", "Variables", "localStorageService", "Socket", function($scope, $location, $state, Styleguide, Variables, localStorageService, Socket) {

    $scope.isNavCollapsed = false;
    $scope.markupSection = {isVisible: true};
    $scope.designerTool = {isVisible: false};

    localStorageService.bind($scope, 'markupSection', {isVisible: true});
    localStorageService.bind($scope, 'designerTool', {isVisible: false});

    // Bind scope variables to service updates
    $scope.sections = Styleguide.sections;
    $scope.config = Styleguide.config;
    $scope.status = Styleguide.status;
    $scope.variables = Variables.variables;

    // Bind variable to scope to wait for data to be resolved
    $scope.socketService = Socket;

    // Check if section is a main section
    $scope.filterMainSections = function() {
      return function(section) {
        return !!section.reference && /^[A-Za-z0-9_-]+$/.test(section.reference);
      };
    };

    $scope.filterSubsections = function(parentSection) {
      return function(section) {
        return new RegExp('^' + parentSection.reference + '\.[A-Za-z0-9_-]+$').test(section.reference);
      };
    };

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.markupSection.isVisible = !$scope.markupSection.isVisible;
      for (var i = 0; i < $scope.sections.data.length; i++) {
        $scope.sections.data[i].showMarkup = $scope.markupSection.isVisible;
      }
    };

    // Change route to /all when searching
    $scope.$watch('search.$', function(newVal) {
      if (typeof newVal === 'string') {
        $state.go('app.index.search', {section: 'all'});
      }
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    };

  }]);

angular.module('sgApp')
  .controller('SectionsCtrl', ["$scope", "$stateParams", "$location", "$state", "$rootScope", "Styleguide", function($scope, $stateParams, $location, $state, $rootScope, Styleguide) {

    if ($stateParams.section) {
      $scope.currentSection = $stateParams.section;
      $rootScope.currentSection = $scope.currentSection;
    }

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function() {
      setPageTitle($scope.currentSection);
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function() {
      setPageTitle($scope.currentSection);
    });

    function setPageTitle(section) {
      if (!Styleguide.config.data || !Styleguide.sections.data) {
        return;
      }
      if (section === 'all') {
        $rootScope.pageTitle = 'All sections - ' + Styleguide.config.data.title;
      } else {
        var result = Styleguide.sections.data.filter(function(item) {
          return item.reference === section;
        });
        if (result.length > 0) {
          $rootScope.pageTitle = result[0].reference + ' ' + result[0].header + ' - ' + Styleguide.config.data.title;

          // Update current reference even before user starts scrolling
          $rootScope.currentReference.section = result[0];
        }
      }
    }

    $scope.isEmptyMainSection = function(section) {
      return section.reference.indexOf('.') === -1 && !section.renderMarkup && (!section.modifiers || section.modifiers.length === 0);
    };

    $scope.isActive = function(section) {
      return section.reference === $rootScope.currentReference.section.reference ? 'active' : '';
    };

    $scope.filterSections = function(section) {
      // Do not show anything with empty search. Showing all items have performance issues
      if ($state.is('app.index.search') && (!$scope.search || !$scope.search.$ || $scope.search.$.length < 3)) {
        return false;
      }
      if ($scope.currentSection === 'all') {
        return true;
      }
      return new RegExp('^' + $scope.currentSection + '(\\D|$)').test(section.reference);
    };

    setPageTitle();
  }]);

angular.module('sgApp')
  .controller('VariablesCtrl', ["$rootScope", "$scope", "$stateParams", "$location", "Styleguide", function($rootScope, $scope, $stateParams, $location, Styleguide) {

    $rootScope.currentSection = '';
    $scope.clearSearch();

    if ($stateParams.variableName) {
      $scope.currentVariable = $stateParams.variableName;
    } else {
      $location.url('overview');
    }

    $scope.getLevel = function() {
      return 'sub';
    };

    findSectionsUsingVariable();

    $rootScope.$on('styles changed', findSectionsUsingVariable);

    function findSectionsUsingVariable() {
      var sections = Styleguide.sections;
      if (sections && sections.data) {
        $scope.relatedSections = sections.data.filter(function(section) {
          return section.variables && section.variables.indexOf($scope.currentVariable) >= 0;
        });
      } else {
        $scope.relatedSections = [];
      }
    }

  }]);

'use strict';

angular.module('sgApp')
  .directive('sgDesign', ["Variables", "Styleguide", function(Variables, Styleguide) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/design.html',
      link: function(scope) {
        var parentRef;

        function isSubSection(section) {
          var ref = section.parentReference;
          return (typeof ref === 'string') &&
            (ref === parentRef || ref.substring(0, ref.indexOf('.')) === parentRef);
        }

        function getVariables(section) {
          return section.variables;
        }

        function concat(a, b) {
          return a.concat(b);
        }

        function unique(a, idx, arr) {
          return a !== undefined && arr.indexOf(a) === idx;
        }

        scope.status = Styleguide.status;
        scope.showRelated = true;

        scope.$watch('currentReference.section', function() {
          var relatedVariables = scope.currentReference.section.variables || [];
          if (scope.showRelated && relatedVariables.length === 0 && scope.sections.data) {
            parentRef = scope.currentReference.section.reference;
            scope.relatedChildVariableNames = scope.sections.data.filter(isSubSection)
              .map(getVariables)
              .reduce(concat, [])
              .filter(unique);
          }
        });

        scope.saveVariables = function() {
          Variables.saveVariables();
        };

        scope.resetLocal = function() {
          Variables.resetLocal();
        };

        scope.dirtyVariablesFound = function() {
          return Variables.variables.some(function(variable) {
            return variable.dirty && variable.dirty === true;
          });
        };

      }
    };
  }]);

'use strict';

angular.module('sgApp')
  .directive('dynamicCompile', ["$compile", "$parse", "$window", function($compile, $parse, $window) {
    return {
      link: function(scope, element, attrs) {
        var parsed = $parse(attrs.ngBindHtml);
        function getStringValue() { return (parsed(scope) || '').toString(); }
        // Recompile if the template changes
        scope.$watch(getStringValue, function() {
          $compile(element, null, 0)(scope);
          // Emit an event that an element is rendered
          element.ready(function() {
            var event = new CustomEvent('styleguide:onRendered', {
              detail: {
                elements: element
              },
              bubbles: true,
              cancelable: true
            });
            $window.dispatchEvent(event);
          });
        });
      }
    };
  }]);

'use strict';

angular.module('sgApp')
  .directive('sgSection', ["$rootScope", "$window", "$timeout", function($rootScope, $window, $timeout) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function(scope, element) {
        function updateCurrentReference() {
          var topOffset = element[0].offsetTop,
            bottomOffset = element[0].offsetTop + element[0].offsetHeight,
            buffer = 50;

          if ($window.pageYOffset > topOffset - buffer && $window.pageYOffset < bottomOffset - buffer) {
            if ($rootScope.currentReference.section.reference !== scope.section.reference) {

              // Assign new current section
              $rootScope.currentReference.section = scope.section;
              if (!scope.$$phase) {
                $rootScope.$apply();
              }
            }
          }
        }

        // Init markup visibility based on global setting
        scope.section.showMarkup = scope.markupSection.isVisible;
        // By default do not show CSS markup
        scope.section.showCSS = false;

        // Listen to scroll events and update currentReference if this section is currently focused
        scope.$on('scroll', function() {
          updateCurrentReference();
        });

        scope.$watch('search.$', function() {
          // Search is not processed completely yet
          // We want to run updateCurrentReference after digest is complete
          $timeout(function() {
            updateCurrentReference();
          });
        });

        // Section location will change still after initialzation
        // We want to run updateCurrentReference after digest is complete
        $timeout(function() {
          updateCurrentReference();
        });
      }
    };
  }]);

'use strict';

angular.module('sgApp')
  .directive('shadowDom', ["Styleguide", "$templateCache", function(Styleguide, $templateCache) {

    var USER_STYLES_TEMPLATE = 'userStyles.html';

    return {
      restrict: 'E',
      transclude: true,
      link: function(scope, element, attrs, controller, transclude) {

        scope.$watch(function() {
          return Styleguide.config;
        }, function() {
          if (typeof element[0].createShadowRoot === 'function' && (Styleguide.config && Styleguide.config.data && !Styleguide.config.data.disableEncapsulation)) {
            angular.element(element[0]).empty();
            var root = angular.element(element[0].createShadowRoot());
            root.append($templateCache.get(USER_STYLES_TEMPLATE));
            transclude(function(clone) {
              root.append(clone);
            });
          } else {
            transclude(function(clone) {
              var root = angular.element(element[0]);
              root.empty();
              root.append(clone);
            });
          }
        }, true);

      }
    };
  }]);

'use strict';

angular.module('sgApp')
  .directive('sgVariable', function() {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/variable.html',
      link: function(scope) {
        var colorRegex = /#[0-9a-f]{3,6}/i;
        scope.color = {};

        function shorthandFormat(str) {
          if (str.length === 7 && str[0] === '#' && str[1] === str[2] && str[3] === str[4] && str[5] === str[6]) {
            return '#' + str[1] + str[3] + str[5];
          }
          return str;
        }

        function extendedFormat(str) {
          if (str.length === 4 && str[0] === '#') {
            return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
          }
          return str;
        }

        function findColor(str) {
          var match = colorRegex.exec(str);
          if (match) {
            return match[0];
          }
        }

        scope.hasColor = function(value) {
          return colorRegex.test(value);
        };

        // Parse first color from the string
        scope.$watch(function() {
          return scope.variable.value;
        }, function() {
          var color = findColor(scope.variable.value);
          if (color) {
            // Store original format. This is needed when we store value back
            scope.color.useShorthand = (color.length === 4);
            // Since color picker does not support compact format we need to always extend it
            scope.color.value = extendedFormat(color);
          }
        });

        // Set changed color back to the string
        scope.$watch(function() {
          return scope.color.value;
        }, function(newVal) {
          var color = newVal;
          // If color was originally stored in the compact format try to convert it
          if (scope.color.useShorthand) {
            color = shorthandFormat(color);
          }
          scope.variable.value = scope.variable.value.replace(colorRegex, color);
        });
      }
    };
  });

angular.module('sgApp')
  .service('Socket', ["$rootScope", "$window", function($rootScope, $window) {

    'use strict';

    var socket,
      connected = false,
      deferredEventListeners = [],
      service = {
        isAvailable: function() {
          return (typeof $window.io !== 'undefined');
        },
        on: function(eventName, listener) {
          var fn = function() {
            var args = arguments;
            $rootScope.$apply(function() {
              listener.apply(undefined, args);
            });
          };

          deferredEventListeners.push({
            event: eventName,
            listener: fn
          });

          if (this.isConnected()) {
            socket.on(eventName, fn);
          }
        },
        emit: function(eventName, data, callback) {
          if (socket) {
            socket.emit(eventName, data, function() {
              var args = arguments;
              $rootScope.$apply(function() {
                if (callback) {
                  callback.apply(undefined, args);
                }
              });
            });
          }
        },
        isConnected: function() {
          return socket !== undefined && connected === true;
        },
        connect: connect
    };

    function connect() {
      if (service.isAvailable()) {
        if (connected) {
          socket.disconnect();
        }

        socket = $window.io.connect();

        deferredEventListeners.forEach(function(deferred) {
          socket.on(deferred.event, deferred.listener);
        });
      }
    }

    service.on('connect', function() {
      connected = true;
      $rootScope.$broadcast('socket connected');
    });

    service.on('disconnect', function() {
      connected = false;
      $rootScope.$broadcast('socket disconnected');
    });

    service.on('error', function(err) {
      $rootScope.$broadcast('socket error', err);
    });

    return service;

  }]);

/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .service('Styleguide', ["$http", "$rootScope", "Socket", "debounce", function($http, $rootScope, Socket, debounce) {

    var _this = this;

    this.sections = {};
    this.config = {};
    this.variables = {};
    this.status = {
      hasError: false,
      error: {},
      errType: ''
    };

    this.get = function() {
      return $http({
        method: 'GET',
        url: 'styleguide.json'
      }).success(function(response) {
        _this.config.data = response.config;
        _this.variables.data = response.variables;
        _this.sections.data = response.sections;

        if (!Socket.isConnected()) {
          Socket.connect();
        }
      });
    };

    this.refresh = debounce(800, function() {
      _this.get();
    });

    Socket.on('styleguide compile error', function(err) {
      _this.status.hasError = true;
      _this.status.error = err;
      _this.status.errType = 'compile';
    });

    Socket.on('styleguide validation error', function(err) {
      _this.status.hasError = true;
      _this.status.error = err;
      _this.status.errType = 'validation';
    });

    Socket.on('styleguide compile success', function() {
      _this.status.hasError = false;
    });

    $rootScope.$on('styles changed', function() {
      _this.refresh();
    });

    $rootScope.$on('progress end', function() {
      _this.refresh();
    });

    // Get initial data
    this.get();
  }]);

(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope, Socket) {

    // Server data contains data initially load from the server
    var _this = this, serverData = [];
    // variables contain the actual data passed outside the service
    // variables could not contain any keys that does not exist in the serverData object
    this.variables = [];

    $rootScope.$watch(function() {
      return _this.variables;
    }, function() {
      if (!_this.refreshDirtyStates() && Styleguide.status.hasError && Styleguide.status.errType === 'validation') {
        // Assume that if there isn't local changes there isn't any errors since data received from the server is always valid
        // Clear only validation errors
        Styleguide.status.hasError = false;
      }
    }, true);

    this.variableMatches = function(var1, var2) {
      return var1.name === var2.name && var1.file === var2.file;
    };

    this.getLocalVar = function(variable) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variableMatches(this.variables[i], variable)) {
          return this.variables[i];
        }
      }
    };

    this.getLocalIndex = function(variable) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variableMatches(this.variables[i], variable)) {
          return i;
        }
      }
    };

    this.getServerVar = function(variable) {
      for (var i = serverData.length - 1; i >= 0; i--) {
        if (this.variableMatches(serverData[i], variable)) {
          return serverData[i];
        }
      }
    };

    this.refreshDirtyStates = function() {
      var _this = this,
        hasDirtyVars = false;
      // Mark variables that differ from the server version as dirty
      angular.forEach(_this.variables, function(variable) {
        var serverVar = _this.getServerVar(variable);
        if (serverVar && serverVar.value !== variable.value) {
          variable.dirty = true;
          hasDirtyVars = true;
        } else if (serverVar && serverVar.value === variable.value && variable.dirty) {
          delete variable.dirty;
        }
      });
      return hasDirtyVars;
    };

    this.refreshValues = function() {
      var oldIndex, oldValue, newObject, i;
      if (serverData.length === 0) {
        this.variables = [];
      } else {
        for (i = 0; i < serverData.length; i++) {
          if (this.variables[i] && !this.variableMatches(this.variables[i], serverData[i])) {
            if (!this.getServerVar(this.variables[i])) {
              // This variable does not exists anymore on the server. Remove it
              this.variables.splice(i, 1);
            } else if (this.getLocalVar(serverData[i]) && !this.getLocalVar(serverData[i]).dirty) {
              // The variable already exists but in another position
              // It is not changed so we can just remove it
              oldIndex = this.getLocalIndex(serverData[i]);
              this.variables.splice(oldIndex, 1);
              this.variables.splice(i, 0, angular.copy(serverData[i]));
            } else if (this.getLocalVar(serverData[i])) {
              // The variable already exists but in another position
              // It is changed so we need to keep the old values
              oldIndex = this.getLocalIndex(serverData[i]);
              oldValue = this.variables[oldIndex].value;
              this.variables.splice(oldIndex, 1);
              newObject = angular.copy(serverData[i]);
              newObject.value = oldValue;
              this.variables.splice(i, 0, newObject);
            } else {
              // The variable does not exists anywhere else. Just add it
              this.variables.splice(i, 0, angular.copy(serverData[i]));
            }
          } else if (this.variables[i] && this.variableMatches(this.variables[i], serverData[i])) {
            // The linenumber might have changed
            this.variables[i].line = serverData[i].line;

            // Variable exists already locally
            // Update value if variable does not have any local changes
            if (!this.variables[i].dirty) {
              this.variables[i].value = serverData[i].value;
            }
          } else if (!this.variables[i]) {
            // Add new local variable
            this.variables.push(angular.copy(serverData[i]));
          }
        }
      }
    };

    this.resetLocal = function() {
      var _this = this;
      // Reset every key to corresponding server value
      angular.forEach(this.variables, function(variable) {
        var serverVar = _this.getServerVar(variable);
        if (serverVar) {
          variable.value = serverVar.value;
        }
      });
    };

    this.setSocket = function(newSocket) {
      this.socket = newSocket;
      if (this.socket) {
        this.addSocketListeners();
      }
      return this;
    };

    this.addSocketListeners = function() {
      this.socket.on('styleguide progress start', function() {
        $rootScope.$broadcast('progress start');
      });
      this.socket.on('styleguide progress end', function() {
        $rootScope.$broadcast('progress end');
      });
      this.socket.on('styleguide styles changed', function() {
        $rootScope.$broadcast('styles changed');
      });
    };

    this.saveVariables = function() {
      if (this.socket) {
        this.socket.emit('variables to server', this.getDirtyVariables());
      } else {
        throw new Error('Socket not available');
      }
    };

    this.getDirtyVariables = function() {
      return this.variables.filter(function(variable) {
        return variable.dirty && variable.dirty === true;
      });
    };

    // Start constructor
    this.init = function(socket) {
      var _this = this;
      this.setSocket(socket);

      // Update new server data when it is available
      $rootScope.$watch(function() {
        return Styleguide.variables.data;
      }, function(newValue) {
        if (newValue) {
          serverData = newValue;
          _this.refreshValues();
          _this.refreshDirtyStates();
        }
      });
    };

    // Run constructor
    this.init(Socket);
  };
  Variables.$inject = ["Styleguide", "$q", "$rootScope", "Socket"];

  angular.module('sgApp').service('Variables', Variables);
}());
