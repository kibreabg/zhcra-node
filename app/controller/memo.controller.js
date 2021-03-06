const db = require('../config/db.config.js');
const jwt = require('jsonwebtoken');
let formidable = require('formidable');
const fs = require('fs');
const Memo = db.memos;

// Post a Memo
exports.create = (req, res) => {
    // Save to MySQL database
    let memo = req.body;

    if (memo.latest === true) {
        db.sequelize.query("UPDATE memos SET latest = false").then(() => {});
    }
    Memo.create(memo).then(result => {
        // Send created memo to client
        res.json(result);
    });
};

// Fetch all Memos
exports.findAll = (req, res) => {
    Memo.findAll().then(memos => {
        // Send all memos to Client
        res.json({
            memos
        });
    });
};

// Find a Memo by Id
exports.findByPk = (req, res) => {
    Memo.findByPk(req.params.memoId).then(memo => {
        res.json(memo);
    })
};

// Update a Memo
exports.update = (req, res) => {
    let memo = req.body;
    let id = req.body.id;
    Memo.update(memo, { where: { id: id } }).then(() => {
        res.status(200).json({ msg: "updated successfully a memo with id = " + id });
    });
};

// Delete a Memo by Id
exports.delete = (req, res) => {
    const id = req.params.memoId;
    Memo.destroy({
        where: { id: id }
    }).then(() => {
        res.status(200).json({ msg: 'deleted successfully a memo with id = ' + id });
    });
};

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
exports.verifyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer s undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        jwt.verify(bearerToken, 'zhcra', (err, authData) => {
            if (err) {
                console.log('Token Verification ', err);
                return res.sendStatus(403);
            } else {
                console.log('Token Verified');
                req.user = authData;
                // Next middleware
                next();
            }
        });

    } else {
        return res.sendStatus(403);
    }
};

exports.upload = (req, res) => {
    //Upload the content file
    var form = new formidable.IncomingForm();
    form.uploadDir = "C:/xampp/htdocs/zhcra/Memo/";
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024; // 10 MB
    form.multiples = true;

    form.on('file', function(field, file) {
        // Rename the incoming file to the file's name
        fs.rename(file.path, form.uploadDir + "/" + file.name, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
        }
    });
    // Upload Ended   

};