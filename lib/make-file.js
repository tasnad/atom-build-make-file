'use babel';

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import voucher from 'voucher';
import { EventEmitter } from 'events';



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
        // match LaTeX errors
        '\\n!\\s+(?<message>(.*\\n)+?l\\.(?<line>\\d+).*)', // alternative match: the message without the last line: '\\n!\\s+(?<message>(.*\\n)+?)l\\.(?<line>\\d+).*'
    ];

    return class MakeBuildProvider extends EventEmitter {
        constructor(cwd) {
            super();
            this.cwd = cwd;
            atom.config.observe('build-make-file.jobs', () => this.emit('refresh'));
            atom.config.observe('build-make-file.makefileNames', () => this.emit('refresh'));
            this.makefiles = atom.config.get('build-make-file.makefileNames').split(',').map(n => n.trim())
            this.curFilePath = null;
        }

        getNiceName() {
            return 'GNU Make in the folder of the current file';
        }

        // Returns true, if a makefile was found in the current file's folder.
        isEligible() {
            try {
                editor = atom.workspace.getActivePaneItem()
                this.curFilePath = path.dirname(editor.buffer.file.path)
                foundMakefiles = this.makefiles.map(f => path.join(this.curFilePath, f)).filter(fs.existsSync);
                return (foundMakefiles.length > 0);
            }
            catch(err) {
                this.curFilePath = null;
                return false;
            }
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

            if (!this.curFilePath) {
                return [emptyTarget];
            }

            const args = ['-j' + atom.config.get('build-make-file.jobs')];
            const promise = voucher(exec, 'make -prRn', { cwd: this.curFilePath })
            return promise.then(output => {
                return output.toString('utf8')
                .split(/[\r\n]{1,2}/)
                .filter(line => /^[a-zA-Z0-9][^$#\/\t=]*:([^=]|$)/.test(line))
                .map(targetLine => targetLine.split(':').shift())
                .map(target => ({
                    exec: 'make',
                    cwd:  this.curFilePath,
                    args: args.concat([target]),
                    name: `GNU Make in current file's folder: ${target}`,
                    sh: false,
                    errorMatch: errorMatch
                }));
            }).catch(e => [ emptyTarget ]);
        }
    };
}
