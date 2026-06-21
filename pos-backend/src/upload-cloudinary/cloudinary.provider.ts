// import { v2 as cloudinary } from 'cloudinary';

// export const CloudinaryProvider = {
//   provide: 'CLOUDINARY',
//   useFactory: () => {
//     return cloudinary.config({
//       cloud_name: 'djltk2q3n',
//       api_key: '672462659274597',
//       api_secret: 'WVTkBmRHVkoWrxnf1MYn6B-JNyA',
//     });
//   },
// };

// cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    cloudinary.config({
      cloud_name: 'djltk2q3n',
      api_key: '672462659274597',
      api_secret: 'WVTkBmRHVkoWrxnf1MYn6B-JNyA',
    });
    return cloudinary;
  },
};