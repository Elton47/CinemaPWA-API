import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { validate } from "class-validator";

class UserController {
  static listAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    const users = await userRepository.find({ select: ['id', 'username', 'role'] });
    res.send(users);
  };

  static getOneById = async (req: Request, res: Response) => {
    const id: number = req.params.id;
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, { select: ['id', 'username', 'role'] });
      res.status(200).send(user);
    } catch (error) {
      res.status(404).send();
    }
  };

  static newUser = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const user = new User();
    user.username = username;
    user.password = password;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    user.hashPassword();
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (error) {
      res.status(409).send('Username already in use');
      return;
    }
    res.status(201).send('User created');
  };

  static editUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { username, role } = req.body;
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    try {
      await userRepository.save(user);
    } catch (error) {
      res.send(409).send('Username already in use');
      return;
    }
    res.status(204).send();
  };

  static deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }
    userRepository.delete(id);
    res.status(204).send();
  };
}
export default UserController;