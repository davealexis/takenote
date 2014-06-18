'use strict';

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

takeNoteApp.controller(
    'NotebookController',
    [
        '$scope',
        '$routeParams',
        '$location',
        'NotebookService',
        function ( $scope, $routeParams, $location, NotebookService ) {
            var notebookId = $routeParams['notebookId'];

            $scope.notesOrderBy = "modified";
            $scope.notesReverseSort = true;
            $scope.model = NotebookService.appModel;
            $scope.showActionControls = false;

            // Open a notebook
            $scope.openNotebook = function ( notebookId ) {
                console.log('OpenNotebook');

                if (notebookId === undefined) {
                    notebookId = $scope.model.currentNotebookId;
                }
                else if (notebookId !== $scope.model.currentNotebookId) {
                    $scope.model.currentNotebookId = notebookId;
                }
                else {
                    return;
                }

                // Get notebook info
                NotebookService.openNotebook(notebookId);

                /*
                var notebook = NotebookService.NotebookRepo(notebookId).get();

                if (notebook !== undefined) {
                    $scope.model.currentNotebook = notebook;
                }
                */
            }

            // Edit a note
            $scope.editNote = function (noteId) {
                $scope.pushView();
                $location.url('/notebook/notes/' + noteId);
                //$location.replace();

                /*console.log('Editing note ' + noteId);

                // Get the note content and populate the editor

                $scope.$apply();

                console.log($scope.model.currentNote);
                $scope.model.currentNoteName = "test";

                // Switch views to the editor
                $scope.pushView("editor");*/
            };

            $scope.closeEditor = function () {
                console.log('Closing editor');
                // TODO:  cleanup note editor

                // Go back to previous view
                $scope.popView();
            };

            $scope.pushView = function () {
                console.log('pushing view ' + $scope.model.currentView);

                $scope.model.previousView = $scope.model.currentView;
                //$scope.model.currentView = newView;
            };

            // Go back to previous view
            $scope.popView = function () {
                console.log('Poping view back to ' + $scope.model.previousView);

                if ($scope.model.previousView !== undefined) {
                    $scope.model.currentView = $scope.model.previousView;
                    $scope.model.previousView = undefined;
                    console.log('pop');
                }
            };

            // Listen to notebook switching event
            $scope.$on("switchNotebook", function (event, data) {
                $scope.openNotebook(data[0]);
            });

            $scope.hoverToggleControls = function () {
                // Shows/hides the delete button on hover
                return $scope.showActionControls = ! $scope.showActionControls;
            };

            // Initialize the view
            //$scope.openNotebook(notebookId);

            $scope.popView();
        }
    ]
);
