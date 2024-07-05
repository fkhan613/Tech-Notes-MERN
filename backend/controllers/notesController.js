const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  //check if we have no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  //update the array of notes and add in the username of each one
  const updatedNotes = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(updatedNotes);
});

// @desc Create a new note
// @route POST /notess
// @access Private
const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  //check for missing data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicate
  const duplicate = await Note.findOne({ title, user }).lean().exec();

  if (duplicate) {
    return res.status(409).json({
      message: "Duplicate note with same title and user already exists",
    });
  }

  //create note
  const newNote = await Note.create({ user, title, text });

  if (newNote) {
    res.status(201).json({ message: "New note created" });
  } else {
    res.status(400).json({ message: "Note was not created" });
  }
});

// @desc Update existing note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  //check for missing data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check if note exists
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  //try to find duplicate with same new title and user
  const duplicate = await Note.findOne({ title, user }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note found" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
});

// @desc Delete existing note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
};
