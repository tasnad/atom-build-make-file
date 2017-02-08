'use babel';

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import voucher from 'voucher';
import { EventEmitter } from 'events';



/**
 * Returns the folder of the currently opened file.
 * If an error occurrs (i.e. the settings pane is open or such),
 * null is returned.
 */
function getCurFilesPath() {
    try {
        editor = atom.workspace.getActivePaneItem();
        ret = path.dirname(editor.buffer.file.path);
        return ret;
    }
    catch(err) {
        return null;
    }

}



export const config = {
    jobs: {
        title: 'Simultaneous jobs',
        description: 'Limits how many jobs make will run simultaneously. Defaults to number of processors-1. Set to 1 for default behavior of make.',
        type: 'number',
        default: os.cpus().length - 1,
        minimum: 1,
        maximum: os.cpus().length,
        order: 1
    },
    makefileNames: {
        title: 'Considered makefile names',
        description: 'Comma separated list of makefile names to search for in the folder of the current file.',
        type: 'string',
        default: 'Makefile, GNUmakefile, makefile',
        order: 2
    }
};



export function provideBuilder() {
    const errorMatch = [
        // match make errors
        '(?<file>[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(fatal error|error|warning):\\s*(?<message>.+)',
        // match LaTeX errors. Given the '-file-line-error' command line switch was passed to LaTeX
        '(?<file>.+\\.tex):(?<line>\\d+):\\s+(?<message>.*)',
    ];

    return class MakeBuildProvider extends EventEmitter {
        constructor(cwd) {
            super();
            this.cwd = cwd;
            atom.config.observe('build-make-file.jobs', () => this.emit('refresh'));
            atom.config.observe('build-make-file.makefileNames', () => this.emit('refresh'));
            this.makefiles = atom.config.get('build-make-file.makefileNames').split(',').map(n => n.trim())
        }

        getNiceName() {
            return 'GNU Make in the folder of the current file';
        }

        // Returns true, if a makefile was found in the current file's folder.
        isEligible() {
            curFilePath = getCurFilesPath()
            if (!curFilePath) {
                return false;
            }

            foundMakefiles = this.makefiles.map(f => path.join(curFilePath, f)).filter(fs.existsSync);
            return (foundMakefiles.length > 0);
        }

        // Either returns all make targets reported by 'make -prRn',
        // or an "empty" target which just states that there were no targets in the makefile.
        settings() {
            const emptyTarget = {
                exec: 'echo "There is no target in the makefile!" && false',
                name: `No target found in makefile.`,
                args: [],
                sh: true,
                errorMatch: []
            };

            curFilePath = getCurFilesPath()
            if (!curFilePath) {
                return [emptyTarget];
            }

            const args = ['-j' + atom.config.get('build-make-file.jobs')];
            const promise = voucher(exec, 'make -prRn', { cwd: curFilePath })
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            return promise.then(output => {
                return output.toString('utf8')
                .split(/[\r\n]{1,2}/)
                .filter(line => /^[a-zA-Z0-9][^$#\/\t=]*:([^=]|$)/.test(line))
                .filter(onlyUnique)
                .map(targetLine => targetLine.split(':').shift())
                .map(target => ({
                    exec: 'make',
                    cwd:  curFilePath,
                    args: args.concat([target]),
                    name: `GNU Make in current file's folder: ${target}`,
                    sh: false,
                    errorMatch: errorMatch
                }));
            }).catch(e => [ emptyTarget ]);
        }
    };
}
