'use strict';

takeNoteApp.factory( 'NotebookService',
    function  ( $rootScope, $resource, $q ) {

        var notebookIndexFolder;
        var notebookFolder;
        var noteFiles = {};
        var notebookFolders = {};

        // ---- Select Notebook Directory ----
        function selectNotebookDirectory()
        {
            chrome.fileSystem.chooseEntry(
                {
                    type: 'openDirectory'
                },
                function(theEntry) {
                    if (!theEntry) {
                        console.log('No Directory selected.');          //****
                        return;
                    }
                    else {
                        if (theEntry.isDirectory) {
                            // Save the directory for later
                            chrome.storage.local.set({'notebookFolder': chrome.fileSystem.retainEntry(theEntry)});

                            // Save local instance so we can use it later
                            notebookIndexFolder = theEntry;

                            // Start reading dirs.
                            readEntries(theEntry);
                        }
                    }
                }
            );
        }

        // ---- Read Entries ---
        function readEntries (theEntry) {
            var dirReader = theEntry.createReader();
            model.notebooks = [];
            dirReader.readEntries (enumerateNotebooks);
        };

        // ---- Get the last saved notebook folder, if any
        function getLastNotebookFolder() {
            var deferred = $q.defer();

            chrome.storage.local.get('notebookFolder', function (result) {
                console.log('Previously used folder: ' + result.notebookFolder);

                if (result.notebookFolder !== undefined) {
                    chrome.fileSystem.restoreEntry(result.notebookFolder, function (folder) {
                        notebookIndexFolder = folder;
                        console.log('About to process ' + folder.name);
                        readEntries(folder);

                        // Now that we've restored our previous notebook folder,
                        // set the last notebook that was being used.
                        chrome.storage.local.get('currentNotebookId',
                            function (result) {
                                if (result === undefined) {
                                    deferred.resolve(undefined);
                                }
                                else {
                                    openNotebook(result.currentNotebookId);
                                    deferred.resolve(result.currentNotebookId);
                                }
                            });

                    });
                }
                else
                    deferred.reject('No folder');
            });

            return deferred.promise;
        }

        // ---- Open a note ----
        function openNoteFile (noteId) {
            console.log('openNote ' + noteId);

            var noteFileIndex = 'note' + noteId;
            var noteFile = noteFiles[noteFileIndex];
            console.log(noteFile);

            var deferred = $q.defer();

            noteFile.file(function (file) {
                var reader = new FileReader();

                reader.onerror = function(e) { console.error(e); };
                reader.onload = function(data) {
                    deferred.resolve(data.target.result);
                };

                reader.readAsText(file);
            });

            return deferred.promise;
        }

        // ---- Open notebook ----
        function openNotebook ( notebookId ) {
            //selectNotebookDirectory();
            //return $resource('/data/' + notebookId + '.json');

            // Get the notebook file entry using the ID
            notebookFolder = notebookFolders[notebookId];

            chrome.storage.local.set({'currentNotebookId': notebookId});

            for (var nb in model.notebooks) {
                if (model.notebooks[nb].id === notebookId) {
                    model.currentNotebook = model.notebooks[nb];
                    break;
                }
            }

            // ---- Read note files ---
            var dirReader = notebookFolder.createReader();
            dirReader.readEntries (enumerateNotes);
        };

        function enumerateNotebooks (results) {
            if (!results.length) {
                console.log(':-|');                                 //****
            }
            else {
                results.forEach(function(item) {
                    console.log('Item: ' + item.name);

                    if (item.isDirectory) {
                        processFolder(item);
                    } else {
                        processNotebookIndexFile(item);
                    }

                    /*  File Entries:
                        *  - fullPath
                        *  - name
                        *  - isDirectory
                        *  - isFile
                        *  - filesystem
                        */
                });
            }
        }

        // ---- Find notes in notebook folder ----
        function enumerateNotes (fileList) {
            if (!fileList.length)
                return;

            noteFiles = {};

            fileList.forEach (function(file) {
                console.log('Item: ' + file.name);

                if (!file.isDirectory) {
                    noteFiles[file.name] = file;
                }
            });
        }


        // ---- Process a sub-folder read while reading a folder ----
        function processFolder (folder) {
            notebookFolders[folder.name] = folder;
        }

        // ---- Process notebook index files and skip all other files ----
        function processNotebookIndexFile (item) {
            if (item.name.endsWith(".json")) {
                // Read the notebook index file
                item.file(function(file) {
                    var reader = new FileReader();

                    reader.onerror = function(e) { console.error(e); };
                    reader.onload = function(data) {
                        var notebook = JSON.parse(data.target.result);
                        model.notebooks.push(notebook);
                        $rootScope.$apply();
                    };

                    reader.readAsText(file);
                });
            }
            else {
                console.log("skipping " + item.name);       //****
            }
        }

        // ---- Save a note ----
        function saveNote(title, text) {
            // Update the Modified date
            model.currentNote.modified = moment().format("YYYY-MM-DD HH:mm:ss");

            // Update the note name if it was changed
            if (title !== model.currentNote.name) {
                model.currentNote.name = title;
            }

            // Save the note
            var fileName = 'note' + model.currentNote.id;
            var noteFile = noteFiles[fileName];

            if (noteFile === undefined) {
                console.error('Opps!');
            }
            else {
                chrome.fileSystem.getWritableEntry(noteFile, function(writablNoteFile) {
                    writablNoteFile.createWriter(function(writer) {
                        writer.onerror = errorHandler;
                        writer.onwriteend = function () {
                        	console.log('Saved');
                        };

                        writer.write(new Blob([text], {type: 'text/plain'}));
                    }, errorHandler);
                });
            }
        }

        function saveNoteAs(title, text) {
        	/*
        	chrome.fileSystem.getWritableEntry(chosenFileEntry, function(writableFileEntry) {
			    writableFileEntry.createWriter(function(writer) {
			      writer.onerror = errorHandler;
			      writer.onwriteend = callback;

			    chosenFileEntry.file(function(file) {
			      writer.write(file);
			    });
			  }, errorHandler);
			});
			*/
        }

        function errorHandler(message) {
        	console.error(message);
        }

        // ---- Define our model ----
        var model = {
            currentView : "list",
            currentNotebookId: undefined,
            currentNotebook: undefined,
            notebooks: [],
            currentNote: {},
            editorDirty: false
        };

        return {
            openNotebook: openNotebook,
            openNoteFile: openNoteFile,
            selectNotebookDirectory: selectNotebookDirectory,
            getLastNotebookFolder: getLastNotebookFolder,
            saveNote: saveNote,
            appModel: model
        };
    }

);




