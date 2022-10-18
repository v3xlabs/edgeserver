import { environment } from '@utils/enviroment';
import { createRoot } from 'react-dom/client';

import { Document } from './_document';

createRoot(document.querySelector('#root')!).render(<Document />);

console.log('ENV', environment.API_URL);
