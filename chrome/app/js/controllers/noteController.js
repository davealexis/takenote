'use strict';

takeNoteApp.controller(
    'NoteController',
    [
        '$scope',
        '$location',
        '$routeParams',
        'NotebookService',
        function ( $scope, $location, $routeParams, NotebookService ) {
            var noteId = $routeParams.noteId;
            $scope.noteTitle;
            $scope.noteText;
            $scope.model = NotebookService.appModel;

            $scope.model.currentView = 'editor';

            for (var i in $scope.model.currentNotebook.notes) {
                var item = $scope.model.currentNotebook.notes[i];
                $scope.noteTitle = item.name;

                if (item.id === noteId) {
                    $scope.model.currentNote = item;

                    console.log($scope.model.currentNote);

                    if (noteId !== undefined) {
                        NotebookService
                        .openNoteFile(noteId)
                        .then (function (fileContents) {
                            console.log(fileContents);
                            $scope.noteText = fileContents;
                            $scope.noteTitle = $scope.model.currentNote.name;
                        });
                    }
                }
            }

            $scope.closeEditor = function() {
                $location.url('/notebook');
            };

            // Listen for the save and exit event
            $scope.$on("saveNoteAndExit", function (event) {
                console.log('Got save note');

                NotebookService.saveNote($scope.noteTitle, $scope.noteText);

                // Close editor and go back to previous view
                $scope.closeEditor();
            });

            // Listen for the save and exit event
            $scope.$on("closeNote", function (event) {
                console.log('Got close note');

                // Close editor and go back to previous view
                $scope.closeEditor();
            });

            $scope.$watch('noteTitle', function (newValue, oldValue) {
                // the Close button to the Save button.
                console.log($scope.editorForm.$dirty);
                $scope.model.editorDirty = $scope.editorForm.$dirty
            });
        }
    ]
);

