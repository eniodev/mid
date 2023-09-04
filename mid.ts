const { randomFillSync } = require('crypto');
const fs = require('fs');
const path = require('path');
const busboy = require('busboy');

interface Preferences {
    saveTo: string
    namingRule?: () => string 
    sizeLimit?: number
    compress: boolean | null
}

interface File {
  filename: string
  encoding: string
  mimeType: string
  data: File
  fieldname: string
  size: number
}

const save = (
  saveTo: string, 
  file: any, 
  namingRule?: () => string
  ) => { 
  const ext = file.filename.split('.').pop();
  saveTo = path.resolve(__dirname, '..', saveTo);
  if(fs.existsSync(saveTo)) {
    const finalPath = path
    .resolve(saveTo, (!namingRule ? `file-${random()}` : namingRule()) + `.${ext}`);
    file.data.pipe(
    fs.createWriteStream(finalPath, (err) => {
      if(err) {
        throw new Error(`Couldn't save file: ${err}`);
      }
    })); 
  }
  else {
    throw new Error(`Invalid Path! ${saveTo}`);
  }
}

const random = (() => {
  const buf = Buffer.alloc(16);
  return () => randomFillSync(buf).toString('hex');
})();

const mid = ({ saveTo, compress, namingRule }: Preferences) => {

  let chunks: Buffer[] = [];
    
    const middle = (req, _, next) => {
    const bb = busboy({ headers: req.headers });
    req.files = [];
    bb.on('file', (name, file, info) => {
      Object.assign(info, { data: file });
      save(saveTo, info, namingRule);
      file.on('data', (data: Buffer) => {
        chunks.push(data);
        req.files.push(info);        
      }).on('close', () => { 
        Object.assign(info, 
          {
            buffer: Buffer.concat(chunks),
            size: Buffer.concat(chunks).length
          })
          chunks = [];
          console.log(info.size);
          next();
      });
    });
    bb.on('field', (name, val, info) => {
       //Say something...
    });
    req.pipe(bb);
}

middle.single = (fieldname: string) => {
    return (req, _, next) => {
      req.file = [];
       const bb = busboy({ headers: req.headers });
       bb.on('file', (name, file, info) => {
        if (name === fieldname) {
          Object.assign(info, { data: file });
          save(saveTo, info);
          file.on('data', (data: Buffer) => {
            chunks.push(data);
            req.file.push(info);
        }).on('close', () => {
            Object.assign(info, 
              { 
                buffer: Buffer.concat(chunks),
                size: Buffer.concat(chunks).length, 
              });
              chunks = [];
            console.log(info.size);
            next();
        });  
        }
        bb.on('field', (name, val, info) => {
         //   console.log(`value: %j`, val);
        });
      });
      req.pipe(bb);  
      }
}
return middle;
};

module.exports = mid;