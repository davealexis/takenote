'use strict';

takeNoteApp.controller(
    'MainController',
    [
        '$scope',
        'NotebookService',
        function ( $scope, NotebookService ) {
            $scope.model = NotebookService.appModel;

            $scope.getNotebookName = function () {
                if ($scope.model !== undefined && $scope.model.currentNotebook !== undefined)
                    return $scope.model.currentNotebook.name;
                else
                    return '';
            };

            $scope.setView = function (view) {
                $scope.model.currentView = view;
            };

            $scope.switchNotebook = function (notebookId) {
                $scope.$broadcast("switchNotebook", [notebookId]);
            };

            $scope.saveAndCloseNote = function () {
                if ($scope.model.editorDirty)
                    $scope.$broadcast("saveNoteAndExit");
                else
                    $scope.$broadcast("closeNote");
            }

            $scope.closeNote = function () {

            }

            $scope.activeIfCurrent = function (notebookId) {
                if (notebookId === $scope.model.currentNotebookId)
                    return 'active';
                else
                    return '';
            };

            $scope.getClassForSave = function () {
                if ($scope.model.editorDirty)
                    return "glyphicon glyphicon-floppy-disk";
                else
                    return "glyphicon glyphicon-remove";
            }

            NotebookService
                .getLastNotebookFolder()
                .then(
                    function (data) {
                        console.log('Got data : ' + data);

                        if (data !== undefined) {
                            NotebookService.openNotebook(data);
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
