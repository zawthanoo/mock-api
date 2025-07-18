const express = require('express')
const validator = require('validator');
const { parse, isValid, format } = require('date-fns');
const { setTimeout } = require('timers/promises');
const multer = require('multer');
const path = require('path');

// app setup
const app = express();
app.use(express.json());


// File Upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// Load mock data
const userList = require('./data/data.json');


app.get('/users', (req, res) => {
    res.json(userList);
});


app.get('/users/:id', async (req, res) => {
    await setTimeout(10000);
    for (const user of userList) {
        if (user.id == req.params.id) {
            res.status(200).json(user);
        }
    }
});


app.get('/depusers', (req, res) => {
    let depUserList = [];
    for (const user of userList) {
        if (user.department == req.query.depName) {
            depUserList.push(user);      
        }
    }
    res.status(200).json(depUserList);
});


app.patch('/users/update', (req, res) => {
    const updatedUser = req.body;
    const email = updatedUser.email;
    const dob = updatedUser.dob;
    const id = updatedUser.id;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const parsedDate = parse(dob, "dd-MM-yyyy", new Date());
    if (!isValid(parsedDate)) {
        return res.status(400).json({ error: 'Invalid date of birth format' });
    }

    if (parsedDate > new Date()) {
        return res.status(400).json({ error: 'Date of birth cannot be in the future' });
    }

    const index = userList.findIndex(user => user.id === id);
    if (index !== -1) {
        userList[index] = updatedUser;
        return res.status(200).json({ message: 'User have been updated.' });
    }
    return res.status(400).json({ error: 'User not found. UserId : ' + id });
});


app.post('/user/add', (req, res) => {
    const createdUser = req.body;
    const email = createdUser.email;
    const dob = createdUser.dob;
    const id = createdUser.id;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ errorCode: "E0001", message: 'Invalid email format' });
    }

    const parsedDate = parse(dob, "dd-MM-yyyy", new Date());
    // Check if date is valid
    if (!isValid(parsedDate)) {
        return res.status(400).json({ errorCode: "E0002", message: 'Invalid date of birth format' });
    }

    // Optional: check if dob is not in the future
    if (parsedDate > new Date()) {
        return res.status(400).json({ errorCode: "E0003", message: 'Date of birth cannot be in the future' });
    }

    for (const user of userList) {
        if (user.id == id) {
            return res.status(400).json({ errorCode: "E0004", message: 'UserId is not available' });
        }
    }
    userList.push(createdUser);
    return res.status(200).json({ message: 'New user is created.' });

});


app.post('/upload', upload.single('file')), (req, res) => {
    if(!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.send("File uploaded successfully: "  + req.file.filename + "_" + req.body.params1)
}

app.post('/upload-multiple', upload.array('fileList')), (req, res) => {
    if(!req.files || req.files.length ===0 ) {
        return res.status(400).send('No files uploaded');
    }
    const fileNames = req.files.map(file => file.filename);
    res.send(`File uploaded ${fileNames.join(', ')}`);
}


const port = process.env.PORT || 3132;
app.listen(port, () => {
    console.log('Mock server started on:', port);
});