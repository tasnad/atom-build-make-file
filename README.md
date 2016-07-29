# GNU Make for Atom (in Current File's Folder)

Uses the [atom-build](https://github.com/noseglid/atom-build) package to execute Make in the current file's folder.

### Description
In contrast to (most) other build providers, this package does not use the atom paths, but the path of the currently active file to search for makefiles.<br>
**ATTENTION:** The file still has to be in one of the atom paths. This is a choice of the build package.

### Usage & Notes
* If the currently shown file is in one of Atom's paths and there is a makefile in the current file's folder, this provider calls make on that makefile.
* You should activate the 'Refresh targets when the target list is shown' option in the build package, so that it searches for makefiles when you open the targets list. Useful to detect new makefiles.
* To match LaTeX errors,invoke your LaTeX engine with the '-file-line-error' command line switch.
* This package requires [atom-build](https://github.com/noseglid/atom-build) to be installed.
* Keep an eye on the target names in the list. They might look similar but come from other providers like build-make.
* *Thanks:* [atom-build-make](https://github.com/AtomBuild/atom-build-make) was a great help creating this package!
