const { UserController } = require('../src/controllers/userController');
const UserModel = require('../models/userModel');

jest.mock('../src/models/userModel', () => ({
  ifUserExist: jest.fn(),
  newUser: jest.fn(),
}));

jest.mock('../src/models/connectDb', () => ({
  getConnection: jest.fn(),
}));

describe('UserController', () => {
  describe('createUser', () => {
    it('should create a new user when user does not exist', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      require('../src/models/userModel').ifUserExist.mockImplementation((email, callback) => {
        callback(null, []);
      });

      require('../src/models/userModel').newUser.mockImplementation((email, password, callback) => {
        callback(null, { ok: true });
      });

      require('../src/models/connectDb').getConnection.mockImplementation((callback) => {
        callback(null, { query: jest.fn() });
      });

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true });

      require('../src/models/userModel').ifUserExist.mockRestore();
      require('../src/models/userModel').newUser.mockRestore();
      require('../src/models/connectDb').getConnection.mockRestore();
    });

  });
});