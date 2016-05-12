# GNU Make for Atom (Builds the Current File)

Uses the [atom-build](https://github.com/noseglid/atom-build) package to execute Make in the current file's folder.

### Description
In contrast to most other build providers, this package does not use the atom paths, but the path of the currently selected file to search for makefiles.<br>
**ATTENTION:** LaTeX errors can only be matched if latex is invoked with the '-file-line-error' command line switch.

### Usage
As far as the currently opened file is in one of Atom's paths and there is a makefile in the current file's folder,
this provider calls make on that makefile.

### Notes
This package requires [atom-build](https://github.com/noseglid/atom-build) to be installed.<br>
The current file still has to be in one of the atom paths. This is a choice of the build package.<br>
*Thanks:* [atom-build-make](https://github.com/AtomBuild/atom-build-make) was a great help creating this package!
