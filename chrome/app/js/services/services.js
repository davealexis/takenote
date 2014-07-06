'use strict';

takeNoteApp.factory( 'NotebookService',
    function  ( $rootScope, $resource, $q, $modal ) {

        // ---- Define our model ----
        var model = {
            currentView : "list",
            currentNotebook: undefined,
            noteId: undefined,
            notebooks: {},
            currentNote: {},
            notebookIndexFolder: {},
            editorDirty: false
        };

        // ---- Select Notebook Directory ----
        function selectNotebookDirectory() {
            chrome.fileSystem.chooseEntry(
                {
                    type: 'openDirectory'
                },
                function(folderEntry) {
                    if (folderEntry !== undefined && folderEntry.length > 0) {
                        if (folderEntry.isDirectory) {
                            // Save the directory for later
                            chrome.storage.local.set({'notebookFolder': chrome.fileSystem.retainEntry(folderEntry)});

                            // Save local instance so we can use it later
                            model.notebookIndexFolder = folderEntry;

                            // Start reading dirs.
                            indexNotebooksInFolder(folderEntry);
                        }
                    }
                }
            );
        }

        // ---- Read Entries ---
        function indexNotebooksInFolder (folder) {
            var dirReader = folder.createReader();
            model.notebooks = {};
            dirReader.readEntries (enumerateNotebooks);
        };

        // ---- Get the last saved notebook folder, if any
        function getLastNotebookFolder() {
            var deferred = $q.defer();

            chrome.storage.local.get('notebookFolder', function (result) {
                if (result.notebookFolder !== undefined) {
                    chrome.fileSystem.restoreEntry(result.notebookFolder, function (folder) {
                        model.notebookIndexFolder = folder;
                        console.log("previous folder " + folder.name);

                        indexNotebooksInFolder(folder);
                        $rootScope.$apply();
                        deferred.resolve(result.currentNotebookId);
                    });
                }
                else
                    deferred.reject('No folder');
            });

            return deferred.promise;
        }

        // ---- Open a note ----
        function openNoteFile (noteId) {
            var deferred = $q.defer();

            var fileName = model.currentNotebook.id + '/note' + noteId;

            model.notebookIndexFolder.getFile(fileName, {create: false}, function(noteFile) {
                noteFile.file(function (file) {
                    var reader = new FileReader();

                    reader.onerror = function(e) { console.error(e); };
                    reader.onload = function(data) {
                        deferred.resolve(data.target.result);
                    };

                    reader.readAsText(file);
                });
            }, errorHandler);

            return deferred.promise;
        }

        // ---- Open notebook ----
        function openNotebook ( notebookId ) {
            chrome.storage.local.set({'currentNotebookId': notebookId});

            model.currentNotebook = model.notebooks[notebookId];
        };

        function enumerateNotebooks (results) {
            if (results.length > 0) {
                results.forEach(function(item) {
                    if (!item.isDirectory) {
                        processNotebookIndexFile(item);
                    }
                });
            }
        }

        // ---- Find notes in notebook folder ----
        /*function enumerateNotes (fileList) {
            if (!fileList.length)
                return;

            ////model.noteFiles = {};

            fileList.forEach (function(file) {
                if (!file.isDirectory) {
                    model.noteFiles[file.name] = file;
                    $rootScope.$apply();
                }
            });
        }*/

        // ---- Process notebook index files and skip all other files ----
        function processNotebookIndexFile (item) {
            if (item.name.endsWith(".json")) {
                // Read the notebook index file
                item.file(function(file) {
                    // Set up the file reader
                    var reader = new FileReader();
                    reader.onerror = function(e) { console.error(e); };
                    reader.onload = function(data) {
                        var notebook = JSON.parse(data.target.result);
                        model.notebooks[notebook.id] = notebook;
                        $rootScope.$apply();
                    };

                    // Kick off the file read
                    reader.readAsText(file);
                });
            }
        }

        // ---- Save a note ----
        function saveNote(title, text) {
            if (model.noteId === undefined) {
                // New note
                model.currentNote = {
                    "id": moment().format("YYYYMMDDHHmmss"),
                    "created": moment().format("YYYY-MM-DD HH:mm:ss"),
                    "modified": moment().format("YYYY-MM-DD HH:mm:ss"),
                    "caret": "0",
                    "top": "0",
                    "name": title,
                };

                // Add the new note to the note index
                model.currentNotebook.notes.push(model.currentNote);
            } else {
                // Update the Modified date
                model.currentNote.modified = moment().format("YYYY-MM-DD HH:mm:ss");
            }

            // Update the note name if it was changed
            if (title !== model.currentNote.name) {
                model.currentNote.name = title;
            }

            // Save the note
            var fileName = model.currentNotebook.id + '/note' + model.currentNote.id;
            writeFileContents(fileName, text);

            // Save the updated notebook index
            writeFileContents(model.currentNotebook.id + ".json", angular.toJson(model.currentNotebook));
        }

        function saveNoteAs(title, text) {

        }

        // ---- Delete a note ----
        function deleteNote(noteId) {
            var fileName = model.currentNotebook.id + '/note' + noteId;

            // Delete the note file
            deleteFile(fileName);

            // Remove the note from the index
            for (var i in model.currentNotebook.notes) {
                if (model.currentNotebook.notes[i].id === noteId) {
                    model.currentNotebook.notes.splice(i, 1);
                }
            }

            // Save the updated notebook index
            writeFileContents(model.currentNotebook.id + ".json", angular.toJson(model.currentNotebook));

            $rootScope.$broadcast("closeNote");
        }

        function copyNoteToNotebook(sourceNotebookId, targetNotebookId, sourceNoteId, moveNote) {
            // Get a reference to the source notebook index and target notebook index
/*            var sourceNotebookIndex = model.notebookIndexFiles[sourceNotebookId];
            var targetNotebookIndex = model.notebookIndexFiles[targetNotebookId];*/

            // Get a reference to the source note file
        }

        /*
         * Create a new notebook
         */
        function createNotebook (notebookName) {
            var response = $q.defer();
            var foundGoodName = true;

            var notebookId = notebookName.toLocaleLowerCase();

            if (model.notebooks[notebookId] !== undefined) {
                var testId;
                foundGoodName = false;

                for (var duplicateIndex = 0; duplicateIndex < 10; duplicateIndex++) {
                    testId = notebookId + "_" + duplicateIndex;

                     if (model.notebooks[testId] === undefined) {
                         // We found an unused ID.  Break out!
                         notebookId = testId;
                         foundGoodName = true;
                         break;
                     }
                }
            }

            if (foundGoodName === false) {
                response.reject("Could not create the new notebook with the specified name.");
            } else {
                // Initialize a new Notebook index object
                var notebook = {
                    "name": notebookName,
                    "id": notebookId,
                    "notes": []
                };

                // Add it to the notebook index collection
                model.notebooks[notebookId] = notebook;

                // Save the new notebook index to disk
                model.notebookIndexFolder.getFile(notebookId + ".json", {create: true}, function(file) {
                    console.log('Writing new notebook index file');

                    // Save the file contents
                    writeFileContents(file, angular.toJson(notebook));

                    // Create the new folder to hold the notes
                    model.notebookIndexFolder.getDirectory(notebookId, {create: true}, function(dirEntry) {
                        // Successfully created the new notebook folder
                        $rootScope.$apply();
                    }, errorHandler);
                }, function (err) {
                    response.reject("Could not write the new notebook index file.");
                });
            }

            return response.promise;
        }


        /*
         * Write data to a file
         */
        function writeFileContents (filePath, contents) {true

            model.notebookIndexFolder.getFile(filePath, {create: true}, function(fileEntry) {
                chrome.fileSystem.getWritableEntry(fileEntry, function(writableFile) {
                    writableFile.createWriter(function(writer) {
                        writer.onerror = errorHandler;
                        writer.onwriteend = function () {
                            writer.truncate(contents.length);
                            writer.onwriteend = null;

                            console.log('Saved ' + filePath);           // TODO:  Display notification?
                        };

                        writer.write(new Blob([contents], {type: 'text/plain'}));
                    }, errorHandler);
                });
            }, errorHandler);

        }

        /*
         * Delete the specified file
         */
        function deleteFile (fileName) {
            model.notebookIndexFolder.getFile(fileName, {create: false}, function(fileEntry) {
                fileEntry.remove(function() {
                }, errorHandler);
            }, errorHandler);
        }

        function errorHandler(message) {
        	console.error(message);
        }

        /*
         * Display delete confirmation dialog
         */
        function confirmDelete (noteid, noteName) {
            console.log('Opening dialog ' + noteName);
            var noteInfo = {
                id: noteid,
                name: noteName
            };

            var modalInstance = $modal.open({
                templateUrl: 'templates/deleteConfirmationModal.html',
                controller: 'DeleteNoteConfirmationModalCtrl',
                //size: 'sm',
                resolve: {
                    noteInfo: function () { return noteInfo; }
                }
            });

            modalInstance.result.then(function (noteId) {
                deleteNote(noteId);
            }, function () {
            });
        }

        return {
            openNotebook: openNotebook,
            openNoteFile: openNoteFile,
            selectNotebookDirectory: selectNotebookDirectory,
            getLastNotebookFolder: getLastNotebookFolder,
            saveNote: saveNote,
            deleteNote: deleteNote,
            createNotebook: createNotebook,
            confirmDelete: confirmDelete,
            appModel: model
        };
    }

);




