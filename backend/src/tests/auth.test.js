const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');
const { sequelize } = require('../config/database');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Authentication Controller', () => {
    before(async () => {
        // Sync database and clear tables
        await sequelize.sync({ force: true });
    });

    after(async () => {
        // Close database connection
        await sequelize.close();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await chai
                .request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message', 'User created successfully');
            expect(res.body).to.have.property('token');
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('email', 'test@example.com');
        });

        it('should not create a user with existing email', async () => {
            const res = await chai
                .request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message', 'Email already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await chai
                .request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Login successful');
            expect(res.body).to.have.property('token');
            expect(res.body).to.have.property('user');
        });

        it('should not login with invalid credentials', async () => {
            const res = await chai
                .request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('message', 'Invalid credentials');
        });
    });
}); 