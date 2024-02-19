// /services/helperService.ts

import AppError from '../utils/appError';
import DataAccess from '../dataBase/dataAccess';
import APIFeatures from '../utils/apiFeatures';

interface QueryObject {
  [key: string]: any; // Adjust according to your query object structure
}

// You might need to adjust the types based on your actual model and request query structure
export const executeQueryWithFeatures = async (
  modelName: string,
  queryObject: QueryObject,
  reqQuery: Record<string, any> // Assuming this structure, adjust as needed
) => {
  const model = DataAccess.getModel(modelName);
  const features = new APIFeatures(model.find(queryObject), reqQuery)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  return await features.query;
};

export const ensureFound = (doc: any, errorMessage = 'No document found'): void => {
  if (!doc) throw new AppError(errorMessage, 404);
};

export const filterObj = (obj: Record<string, any>, ...allowedFields: string[]): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
