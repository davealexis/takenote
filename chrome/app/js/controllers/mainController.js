'use strict';

takeNoteApp.controller(
    'MainController',
    [
        '$scope',
        'NotebookService',
        '$modal',
        function ($scope, NotebookService, $modal) {
            $scope.model = NotebookService.appModel;

            /*
             * Set the current view to list or card view.
             */
            $scope.setView = function (view) {
                $scope.model.currentView = view;
            };

            /*
             * Switch to the selected notebook
             */
            $scope.switchNotebook = function (notebookId) {
                $scope.$broadcast("switchNotebook", [notebookId]);
            };

            /*
             * Save and close the current note.=
             */
            $scope.saveAndCloseNote = function () {
                if ($scope.model.editorDirty)
                    $scope.$broadcast("saveNoteAndExit");
                else
                    $scope.$broadcast("closeNote");
            };

            /*
             * Save the current note to the file system
             */
            $scope.saveNote = function () {
                $scope.$broadcast("saveNote");
            };

            /*
             * Close the current note and go back to the previous view
             */
            $scope.closeNote = function () {
                $scope.$broadcast("closeNote");
            };

            /*
             * Create a new note
             */
            $scope.newNote = function () {
                $scope.$broadcast("newNote");
            };

            /*
             * Display the delete confirmation dialog
             */
            $scope.confirmDelete = function () {
                NotebookService.confirmDelete($scope.model.currentNote.id, $scope.model.currentNote.name);
            }

            /*
             * Helper method to determine if a notebook is active
             */
            $scope.activeIfCurrent = function (notebookId) {
                if (notebookId === $scope.model.currentNotebookId)
                    return 'active';
                else
                    return '';
            };

            /*
             * Delete the specified note
             */
            $scope.deleteNote = function (noteId) {
                NotebookService.deleteNote($scope.model.currentNotebookId, noteId);
            };

            /*
             * Create Notebook
             */
            $scope.createNotebook = function () {
                // Display a dialog to get the new notebook name,
                // then create the notebook index and folder, and
                // display the notebook in the notebook list.

                $scope.newNotebookInfo = { name: undefined };

                var modalInstance = $modal.open({
                    templateUrl: 'templates/newNotebookModal.html',
                    controller: 'CreateNotebookModalCtrl',
                    //size: 'sm',
                    resolve: {
                        newNotebookInfo: function () { return $scope.newNotebookInfo; }
                    }
                });

                modalInstance.result.then(function (notebookName) {
                    console.info('New notebook: ' + notebookName);
                    NotebookService.createNotebook(notebookName);
                }, function (err) {
                    console.error(err);
                });
            }

            /* - - - - - - - - End Function Definitions - - - - - - - - */


            /*
             * Restore the noewbook previously in use the last time the app was launched
             */
            NotebookService
                .getLastNotebookFolder()
                .then(
                    function (data) {
                        if (data !== undefined) {
                            console.log('attempting to load notebook ' + data);
                            $scope.switchNotebook(data);
                        }
                    },
                    function (error) {
                        // We didn't find a previously used folder.  Ask the user for one.
                        // (should not do this.  let user click button to get folder.)
                        console.error(error);
                        NotebookService.selectNotebookDirectory();
                    }
            );


        }
    ]
);
