"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mid = require('./mid');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const namingRule = () => {
    return Date.now() + '-' + Math.round(Math.random() * 1E9);
};
const middle = mid({ saveTo: 'uploads', namingRule });
app.post('/', middle, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(typeof req.file);
    console.log(req.file);
}));
const port = process.env.PORT || 3000;
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('UP!');
}));
//# sourceMappingURL=index.js.map