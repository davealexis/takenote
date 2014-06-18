'use strict';

takeNoteApp.directive(
    'izzyNoteeditor',
    function() {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/directives/noteEditor.html'
        };
    }
);
