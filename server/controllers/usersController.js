import UsersModel from '../model/usersModel';
import generateToken from '../helpers/token';
import errorStrings from '../helpers/errorStrings';
import ResponseHelper from '../helpers/responseHelper';


const usersModel = new UsersModel('users');

/**
* @fileOverview - class manages all users logic
* @class - usersController
* @requires - ../model/usersModel
* @requires - ../helpers/token
* @requires - ../helpers/errorStrings
* @requires - ../helpers/responseHelper
* @exports - usersController.js
* */

class UsersController {
  /**
 * Register a user
 * @param {object} req
 * @param {object} res
 */

  static async signup(req, res) {
    try {
      const isAreadyRegistered = await usersModel.findUserByEmail(req.body.email);
      if (isAreadyRegistered) {
        return ResponseHelper.error(res, 409, errorStrings.emailExists);
      }

      const newUser = await usersModel.signupQuery(req.body);
      if (!newUser) {
        throw new Error(errorStrings.serverError);
      }
      const userData = {
        user_id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        is_admin: newUser.is_admin,
        token: generateToken(newUser),
      };

      return ResponseHelper.success(res, 201, userData);
    } catch (error) {
      return ResponseHelper.error(res, 500, errorStrings.serverError);
    }
  }

  /**
     * Login a user
     * @param {object} req
     * @param {object} res
     */

  static async signin(req, res) {
    try {
      const signInResult = await usersModel.signinQuery(req.body);

      if (signInResult.error === 'wrong-password') {
        return ResponseHelper.error(res, 403, errorStrings.loginFailure);
      }
      if (!signInResult) {
        throw new Error(errorStrings.serverError);
      }
      const userData = {
        user_id: signInResult.id,
        first_name: signInResult.first_name,
        last_name: signInResult.last_name,
        email: signInResult.email,
        is_admin: signInResult.is_admin,
        token: generateToken(signInResult),
      };
      return ResponseHelper.success(res, 200, userData);
    } catch (error) {
      return ResponseHelper.error(res, 500, errorStrings.serverError);
    }
  }
}

export default UsersController;
