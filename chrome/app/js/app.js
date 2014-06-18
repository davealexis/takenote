'use strict';

var takeNoteApp = angular.module("takeNote", [
    'ngRoute',
    'ngResource']);

takeNoteApp.config(
    [
        '$routeProvider',
        function( $routeProvider ) {
            $routeProvider.
                when ( '/notebook', {
                    templateUrl: 'templates/notebook.html',
                    controller: 'NotebookController'
                }).
                when ( '/notebook/notes/:noteId', {
                    templateUrl: 'templates/noteEditorTemplate.html',
                    controller: 'NoteController'
                }).
                when ( '/notebooks', {
                    templateUrl: 'templates/notebookList.html',
                    controller: 'NotebookListController'
                }).
                otherwise ( {
                        redirectTo: '/notebook'
                });
        }
    ]
);

takeNoteApp.directive(
    'showonhoverparent',
    function() {
      return {
          link : function(scope, element, attrs) {
              element.parent().bind('mouseenter', function() {
                  element.show();
              });
              element.parent().bind('mouseleave', function() {
                  element.hide();
              });
          }
      };
    });
