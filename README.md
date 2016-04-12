# Make build system for Atom

Uses the [atom-build](https://github.com/noseglid/atom-build) package to execute Make in the current file's folder

* In contrast to most other build providers, this package does not use the atom paths, but the path of the currently selected file to search for makefiles.
* Note that the current file still has to be in one of the atom paths! This is a choice of the build package.
* Also matches LaTeX errors.

This package requires [atom-build](https://github.com/noseglid/atom-build) to be installed.

** Note [atom-build-make](https://github.com/AtomBuild/atom-build-make) was a great help creating this package!
