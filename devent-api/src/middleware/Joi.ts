import Joi, { ObjectSchema } from "joi";
import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/User";
import Logging from "../library/Logging";

export const ValidateJoi = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);

      next();
    } catch (error) {
      Logging.error(error);

      return res.status(422).json({ error });
    }
  };
};

export const Schemas = {
  user: {
    create: Joi.object<IUser>({
      pubkey: Joi.string().required(),
    }),
    update: Joi.object<IUser>({
      pubkey: Joi.string().required(),
    }),
  },
  //   book: {
  //     create: Joi.object<IBook>({
  //       user: Joi.string()
  //         .regex(/^[0-9a-fA-F]{24}$/)
  //         .required(),
  //       title: Joi.string().required(),
  //     }),
  //     update: Joi.object<IBook>({
  //       user: Joi.string()
  //         .regex(/^[0-9a-fA-F]{24}$/)
  //         .required(),
  //       title: Joi.string().required(),
  //     }),
  //   },
};
