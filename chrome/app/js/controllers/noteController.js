'use strict';

takeNoteApp.controller(
    'NoteController',
    [
        '$scope',
        '$location',
        'NotebookService',
        function ( $scope, $location, NotebookService ) {
            // The ID of the note to be edited is in $scope.model.noteId

            $scope.noteTitle;
            $scope.noteText;
            $scope.model = NotebookService.appModel;
            $scope.model.currentView = 'editor';
            $scope.noteId =$scope.model.noteId;

            if ($scope.noteId !== undefined) {
                // Find the requested note in the notebook index
                for (var i in $scope.model.currentNotebook.notes) {
                    var item = $scope.model.currentNotebook.notes[i];

                    if (item.id === $scope.noteId) {
                        $scope.model.currentNote = item;
                        $scope.noteTitle = item.name;

                        if ($scope.noteId !== undefined) {
                            NotebookService
                                .openNoteFile($scope.noteId)
                                .then (function (fileContents) {
                                    $scope.noteText = fileContents;
                                    $scope.noteTitle = $scope.model.currentNote.name;
                                },
                                function (err) {
                                    console.error("Could not find the file.")
                                });
                        }
                    }
                }
            }

            $scope.closeEditor = function() {
                $location.url('/notebook');
            };

            // Listen for the save and exit event
            $scope.$on("saveNoteAndExit", function (event) {
                NotebookService.saveNote($scope.noteTitle, $scope.noteText);
                $scope.model.editorDirty = false;

                // Close editor and go back to previous view
                $scope.closeEditor();
            });

            // Listen for the save event
            $scope.$on("saveNote", function (event) {
                if ($scope.model.noteId === undefined) {
                    console.log("Yay@  New Note");
                    return;
                }

                NotebookService.saveNote($scope.noteTitle, $scope.noteText);
                $scope.model.editorDirty = false;
            });

            // Listen for the exit event
            $scope.$on("closeNote", function (event) {
                // Close editor and go back to previous view
                $scope.closeEditor();
            });

            $scope.$watch('noteTitle', function (newValue, oldValue) {
                $scope.setDirty();
            });

            $scope.$watch('noteText', function (newValue, oldValue) {
                $scope.setDirty();
            });

            $scope.setDirty = function () {
                // Change the Close button to the Save button.
                $scope.model.editorDirty = $scope.editorForm.$dirty;
            }
        }
    ]
);

