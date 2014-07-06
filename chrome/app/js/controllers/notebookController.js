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
            $scope.confirmDelete = NotebookService.confirmDelete;

            // Open a notebook
            $scope.openNotebook = function ( notebookId ) {
                console.log('OpenNotebook ' + notebookId);

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
            }

            // Edit a note
            $scope.editNote = function (noteId) {
                $scope.pushView();
                $scope.model.noteId = noteId;
                $location.url('/notebook/noteEditor');
            };

            $scope.closeEditor = function () {
                // Go back to previous view
                $scope.popView();
            };

            $scope.pushView = function () {
                $scope.model.previousView = $scope.model.currentView;
            };

            // Go back to previous view
            $scope.popView = function () {
                if ($scope.model.previousView !== undefined) {
                    console.log('Poping view back to ' + $scope.model.previousView);

                    $scope.model.currentView = $scope.model.previousView;
                    $scope.model.previousView = undefined;
                }
            };

            $scope.hoverToggleControls = function () {
                // Shows/hides the delete button on hover
                return $scope.showActionControls = ! $scope.showActionControls;
            };

            $scope.getNotebookName = function () {
                if ($scope.model !== undefined && $scope.model.currentNotebook !== undefined)
                    return $scope.model.currentNotebook.name;
                else
                    return '';
            };

            $scope.activeIfCurrent = function (notebookId) {
                if (notebookId === $scope.model.currentNotebookId)
                    return 'active';
                else
                    return '';
            };

            // Listen to notebook switching event
            $scope.$on("switchNotebook", function (event, data) {
                $scope.openNotebook(data[0]);
            });

            /*
             * Handle New Note event
             */
            $scope.$on('newNote', function (event, data) {
                $scope.pushView();
                $scope.model.noteId = undefined;
                $location.url('/notebook/noteEditor');
            });

            /*
             *
             */
            $scope.handleDrop = function() {
                console.log('Item has been dropped');
            }

            $scope.popView();
        }
    ]
);
