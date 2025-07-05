const express = require('express')
const validator = require('validator');
const { parse, isValid, format } = require('date-fns');

const app = express();
app.use(express.json());

const userList = require('./data/data.json');

const port = process.env.PORT || 3132;

app.get('/users', (req, res) => {
    res.json(userList);
})

app.get('/users/:id', (req, res) => {
    for (const user of userList) {
        if (user.id == req.params.id) {
            res.status(200).json(user);
        }
    }
})

app.get('/depusers', (req, res) => {
    let depUserList = [];
    for (const user of userList) {
        if (user.department == req.query.depName) {
            depUserList.push(user);      
        }
    }
    res.status(200).json(depUserList);
})

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
})

app.post('/users/add', (req, res) => {
    const createdUser = req.body;
    const email = createdUser.email;
    const dob = createdUser.dob;
    const id = createdUser.id;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const parsedDate = parse(dob, "dd-MM-yyyy", new Date());
    // Check if date is valid
    if (!isValid(parsedDate)) {
        return res.status(400).json({ error: 'Invalid date of birth format' });
    }

    // Optional: check if dob is not in the future
    if (parsedDate > new Date()) {
        return res.status(400).json({ error: 'Date of birth cannot be in the future' });
    }

    for (const user of userList) {
        if (user.id == id) {
            return res.status(400).json({ error: 'UserId is not available' });
        }
    }
    userList.push(createdUser);
    return res.status(200).json({ message: 'New user is created.' });

})

app.listen(port, () => {
    console.log('Mock server started on:', port);
})