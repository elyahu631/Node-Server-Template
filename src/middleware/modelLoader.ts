// middleware/modelLoader.ts

import fs from 'fs';
import path from 'path';

// TypeScript doesn't natively support synchronous dynamic imports using `require`,
// but you can use `require` in a similar way if you're running in a Node.js environment
// that supports CommonJS. Otherwise, consider using dynamic import() for asynchronous loading.

const loadModels = (modelsPath: string): void => {
  fs.readdirSync(modelsPath).forEach(file => {
    if (path.extname(file) === '.js' || path.extname(file) === '.ts') {
      // Dynamically require JS or TS files. Note: TS files would need to be compiled to JS.
      require(path.join(modelsPath, file));
    }
  });
};

export default loadModels;
