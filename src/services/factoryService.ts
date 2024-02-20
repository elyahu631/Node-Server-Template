// services/factoryService.ts

import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';
import DataAccess from '../utils/dataBase/dataAccess';

import { Request, Response, NextFunction } from 'express';

type ModelName = string;

export const deleteOne = (modelName: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await DataAccess.deleteById(modelName, req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });


export const updateOne = (modelName: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DataAccess.updateById(modelName, req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

export const createOne = (modelName: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DataAccess.create(modelName, req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });


export const getOne = (modelName: ModelName, popOptions?: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DataAccess.findById(modelName, req.params.id, popOptions);

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

export const getAll = (modelName: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const queryString = req.query as Record<string, string | undefined>;

    const features = new APIFeatures(DataAccess.getModel(modelName).find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query.exec();
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });
