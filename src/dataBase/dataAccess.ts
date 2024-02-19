// dataBase/dataAccess.ts

import mongoose, { Document, Model } from 'mongoose';
import AppError from '../utils/appError';
class DataAccess {
  private static instance: DataAccess;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DataAccess {
    if (!DataAccess.instance) {
      DataAccess.instance = new DataAccess();
    }
    return DataAccess.instance;
  }

  public getModel<T extends Document>(modelName: string): Model<T> {
    return mongoose.model<T>(modelName);
  }

  public async saveDocument<T extends Document>(document: T, options = {}): Promise<T> {
    if (!document || typeof document.save !== 'function') {
      throw new AppError('Invalid document or document does not have a save method', 400);
    }

    try {
      const savedDocument = await document.save(options);
      return savedDocument;
    } catch (error) {
      throw new AppError('Failed to save the document', 500);
    }
  }

  public async create<T extends Document>(modelName: string, data: any): Promise<T> {
    const Model = this.getModel<T>(modelName);
    const document = await Model.create(data);
    if ((document as any).password) {
      (document as any).password = undefined; // Ensure the password is not returned
    }
    return document;
  }

  public async findById<T extends Document>(
    modelName: string,
    id: string,
    populateOptions?: string | string[] | mongoose.PopulateOptions | mongoose.PopulateOptions[]
  ): Promise<T | null> {
    const Model = this.getModel<T>(modelName);
    let query: any = Model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    
    const document = await query.exec();
    if (!document) {
      throw new AppError('No document found with that ID', 404);
    }
    return document;
  }

  public async updateById<T extends Document>(
    modelName: string,
    id: string,
    updateData: any
  ): Promise<T | null> {
    const Model = this.getModel<T>(modelName);
    const document = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      throw new AppError('No document found with that ID', 404);
    }
    return document;
  }

  public async deleteById(modelName: string, id: string): Promise<void> {
    const Model = this.getModel<Document>(modelName);
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      throw new AppError('No document found with that ID', 404);
    }
  }

  public async findOneByConditions<T extends Document>(
    modelName: string,
    conditions: any,
    projection: any = {},
    options: any = {}
  ): Promise<T | null> {
    const Model = this.getModel<T>(modelName);
    const document = await Model.findOne(conditions, projection, options);
    return document as T | null;
  }

  public async updateMany(modelName: string, filter: any, updateData: any): Promise<any> {
    const Model = this.getModel<Document>(modelName);
    const result = await Model.updateMany(filter, updateData);
    return result;
  }

  public async aggregate(modelName: string, pipeline: Array<any>): Promise<any[]> {
    const Model = this.getModel<Document>(modelName);
    try {
      const results = await Model.aggregate(pipeline);
      return results;
    } catch (error) {
      throw new AppError('Aggregation failed', 500);
    }
  }
}

// Export a singleton instance of DataAccess
export default DataAccess.getInstance();
