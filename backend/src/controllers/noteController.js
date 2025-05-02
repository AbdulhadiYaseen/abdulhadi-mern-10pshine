const { dbLogger } = require('../utils/logger');
const { Note } = require('../models');

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.create({
            title,
            content,
            userId: req.user.id
        });

        dbLogger.info(`Note created by user ${req.user.id}: ${note.id}`);
        res.status(201).json({
            message: 'Note created successfully',
            note
        });
    } catch (error) {
        dbLogger.error('Error creating note:', error);
        res.status(500).json({ message: 'Error creating note', error: error.message });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        dbLogger.info(`Notes retrieved for user ${req.user.id}`);
        res.json(notes);
    } catch (error) {
        dbLogger.error('Error retrieving notes:', error);
        res.status(500).json({ message: 'Error retrieving notes', error: error.message });
    }
};

exports.getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!note) {
            dbLogger.warn(`Note not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Note not found' });
        }

        dbLogger.info(`Note retrieved: ${note.id}`);
        res.json(note);
    } catch (error) {
        dbLogger.error('Error retrieving note:', error);
        res.status(500).json({ message: 'Error retrieving note', error: error.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const [updated] = await Note.update(
            { title, content },
            {
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            }
        );

        if (!updated) {
            dbLogger.warn(`Note not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Note not found' });
        }

        const updatedNote = await Note.findByPk(req.params.id);
        dbLogger.info(`Note updated: ${updatedNote.id}`);
        res.json({
            message: 'Note updated successfully',
            note: updatedNote
        });
    } catch (error) {
        dbLogger.error('Error updating note:', error);
        res.status(500).json({ message: 'Error updating note', error: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const deleted = await Note.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!deleted) {
            dbLogger.warn(`Note not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Note not found' });
        }

        dbLogger.info(`Note deleted: ${req.params.id}`);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        dbLogger.error('Error deleting note:', error);
        res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
}; 