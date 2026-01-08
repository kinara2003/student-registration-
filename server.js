const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/studentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Student schema
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    course: String,
    gender: String,
    address: String
});
const Student = mongoose.model('Student', studentSchema);

// CRUD routes
app.get('/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

app.get('/students/:id', async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.json(student);
});

app.post('/students', async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    // return the saved student (including _id) so frontend can use it if needed
    res.json(student);
});

app.put('/students/:id', async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Student updated' });
});

app.delete('/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
