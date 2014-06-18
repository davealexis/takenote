'use strict';

takeNoteApp.directive(
    'izzyNotebooksView',
    function() {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/directives/notebooksView.html'
        };
    }
);
