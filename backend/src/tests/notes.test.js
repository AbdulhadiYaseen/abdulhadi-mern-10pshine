const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');
const Note = require('../models/Note');
const { sequelize } = require('../config/database');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Notes Controller', () => {
    let authToken;
    let testUser;

    before(async () => {
        // Sync database and clear tables
        await sequelize.sync({ force: true });

        // Create test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Login to get token
        const res = await chai
            .request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = res.body.token;
    });

    after(async () => {
        // Close database connection
        await sequelize.close();
    });

    describe('POST /api/notes', () => {
        it('should create a new note', async () => {
            const res = await chai
                .request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Note',
                    content: 'This is a test note'
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message', 'Note created successfully');
            expect(res.body).to.have.property('note');
            expect(res.body.note).to.have.property('title', 'Test Note');
        });
    });

    describe('GET /api/notes', () => {
        it('should get all notes for the user', async () => {
            const res = await chai
                .request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.have.property('title', 'Test Note');
        });
    });

    describe('GET /api/notes/:id', () => {
        it('should get a specific note', async () => {
            // First create a note
            const createRes = await chai
                .request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Specific Note',
                    content: 'This is a specific note'
                });

            const noteId = createRes.body.note.id;

            const res = await chai
                .request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('title', 'Specific Note');
        });

        it('should not get a note that does not belong to the user', async () => {
            // Create another user
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            // Create a note for the other user
            const otherNote = await Note.create({
                title: 'Other Note',
                content: 'This is another note',
                userId: otherUser.id
            });

            const res = await chai
                .request(app)
                .get(`/api/notes/${otherNote.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Note not found');
        });
    });

    describe('PUT /api/notes/:id', () => {
        it('should update a note', async () => {
            // First create a note
            const createRes = await chai
                .request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Note to Update',
                    content: 'This note will be updated'
                });

            const noteId = createRes.body.note.id;

            const res = await chai
                .request(app)
                .put(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Note',
                    content: 'This note has been updated'
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Note updated successfully');
            expect(res.body.note).to.have.property('title', 'Updated Note');
        });
    });

    describe('DELETE /api/notes/:id', () => {
        it('should delete a note', async () => {
            // First create a note
            const createRes = await chai
                .request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Note to Delete',
                    content: 'This note will be deleted'
                });

            const noteId = createRes.body.note.id;

            const res = await chai
                .request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Note deleted successfully');
        });
    });
}); 