"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { randomFillSync } = require('crypto');
const fs = require('fs');
const path = require('path');
const busboy = require('busboy');
const save = (saveTo, file, namingRule) => {
    const ext = file.filename.split('.').pop();
    saveTo = path.resolve(__dirname, '..', saveTo);
    if (fs.existsSync(saveTo)) {
        const finalPath = path
            .resolve(saveTo, (!namingRule ? `file-${random()}` : namingRule()) + `.${ext}`);
        file.data.pipe(fs.createWriteStream(finalPath, (err) => {
            if (err) {
                throw new Error(`Couldn't save file: ${err}`);
            }
        }));
    }
    else {
        throw new Error(`Invalid Path! ${saveTo}`);
    }
};
const random = (() => {
    const buf = Buffer.alloc(16);
    return () => randomFillSync(buf).toString('hex');
})();
const mid = ({ saveTo, compress, namingRule }) => {
    let chunks = [];
    const middle = (req, _, next) => {
        const bb = busboy({ headers: req.headers });
        req.files = [];
        bb.on('file', (name, file, info) => {
            Object.assign(info, { data: file });
            save(saveTo, info, namingRule);
            file.on('data', (data) => {
                chunks.push(data);
                req.files.push(info);
            }).on('close', () => {
                Object.assign(info, {
                    buffer: Buffer.concat(chunks),
                    size: Buffer.concat(chunks).length
                });
                chunks = [];
                console.log(info.size);
            });
        });
        bb.on('field', (name, val, info) => {
            //Say something...
        });
        req.pipe(bb);
        next();
    };
    middle.single = (fieldname) => {
        return (req, _, next) => {
            req.file = [];
            const bb = busboy({ headers: req.headers });
            bb.on('file', (name, file, info) => {
                if (name === fieldname) {
                    Object.assign(info, { data: file });
                    save(saveTo, info);
                    file.on('data', (data) => {
                        chunks.push(data);
                        req.file.push(info);
                    }).on('close', () => {
                        Object.assign(info, {
                            buffer: Buffer.concat(chunks),
                            size: Buffer.concat(chunks).length,
                        });
                        chunks = [];
                        console.log(info.size);
                    });
                }
                bb.on('field', (name, val, info) => {
                    //   console.log(`value: %j`, val);
                });
            });
            req.pipe(bb);
            next();
        };
    };
    return middle;
};
module.exports = mid;
//# sourceMappingURL=mid.js.map