const Note = require('../models/Note')

exports.createNote = async (req,res) => {
    try{
        const {title,content} = req.body
        const userId = req.user.userId
        const note = await Note.create({title,content,userId})

        res.status(201).json({message: 'Note created', note})
    } catch (error){
        res.status(500).json({error:'Failed to create note'})
    }
}


exports.getNotes = async (req,res) => {
    try{
        const userId=req.user.userId

        const notes = await Note.findAll({where:{userId}})

        res.json(notes)
    } catch (error){
        res.status(500).json({error:'Failed to get notes'})
    }
}

exports.updateNote = async (req,res) => {
    try{
        const {id} = req.params
        const {title, content} = req.body
        const userId = req.user.userId

        const note = await Note.findOne({where: { id,userId}})

        if(!note) return res.status(404).json({error:'Note Not Found'})

        note.title = title
        note.content = content
        await note.save()
        res.json({message:'Note Updated', note})
    } catch(error){
        res.status(500).json({error:'Failed to update note'})
    }
}


exports.deleteNote = async (req,res) => {
    try{
        const {id} = req.params
        const userId = req.user.userId
        const note = await Note.findOne({where:{ id,userId}})

        if(!note) return res.status(404).json({error: 'Note not found'})

        await note.destroy()

        res.json({message:'Note deleted'})
    } catch(error){
        res.status(500).json({error: 'Failed to delete note'})
    }
}