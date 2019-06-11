import { Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import config from "../config/config";
import { validate } from "class-validator";

class AuthController {
  static login = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send();
    }
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { username }});
    } catch (error) {
      res.status(401).send();
    }
    if (!user.checkIfDecryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: '1h' });
    res.send(token);
  };

  static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(401).send();
    }

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    user.hashPassword();
    userRepository.save(user);
    res.status(204).send();
  };
}
export default AuthController;