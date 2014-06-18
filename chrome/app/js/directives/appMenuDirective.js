'use strict';

takeNoteApp.directive(
    'izzyAppMenu',
    ['NotebookService',
        function ($scope, NotebookService) {
            function link (scope, elements, attr) {
                console.log(scope.showMenu);
            }

            return {
                restrict: 'E',
                templateUrl: 'templates/directives/appMenuTemplate.html',
                replace: true,
                scope: {
                    showMenu: '=showMenu',
                    togglemenu: '&toggleMenu'
                },
                link: link
            };
        }
    ]
);
