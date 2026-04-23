// import { Injectable } from '@nestjs/common';
// import { v2 as cloudinary } from 'cloudinary';
// import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
// import * as streamifier from 'streamifier';

// @Injectable()
// export class UploadCloudinaryService {
//   /** បង្ហោះរូបភាព និងត្រលប់មកវិញនូវ Format ដែលអ្នកចង់បាន */
//   async uploadImage(
//     file: Express.Multer.File,
//     folder: string = 'pos-general', // អាចប្តូរ folder បានតាមចិត្ត
//   ): Promise<any> {
//     return new Promise((resolve, reject) => {
//       const upload = cloudinary.uploader.upload_stream(
//         { folder: folder },
//         (error, result: UploadApiResponse) => {
//           if (error) return reject(error);

//           // រៀបចំទិន្នន័យឱ្យដូច JSON ដែលអ្នកបានបង្ហាញពីមុan
//           resolve({
//             originalFileName: file.originalname,
//             fileName: `${result.public_id}.${result.format}`,
//             filePath: result.folder,
//             fileUrl: result.secure_url,
//             fileExtension: result.format,
//             fileSize: file.size,
//             uploadBy: "admin",
//             destinationStorage: "CLOUDINARY",
//             width: result.width,
//             height: result.height,
//             id: result.asset_id,
//             uploadType: "file-upload-type-general",
//             isDeleted: false,
//             uploadDate: new Date().toISOString(),
//           });
//         },
//       );

//       streamifier.createReadStream(file.buffer).pipe(upload);
//     });
//   }

//   /** មើលបញ្ជីរូបភាពដែលបានបង្ហោះ (Recent 100) */
//   async listResources(): Promise<any> {
//     return cloudinary.api.resources({ max_results: 100 });
//   }

//   /** ទាញយកព័ត៌មានរូបភាពតែមួយតាមរយៈ Public ID */
//   async getResource(publicId: string): Promise<any> {
//     return cloudinary.api.resource(publicId);
//   }

//   /** ប្តូរឈ្មោះ ឬ ប្តូរទីតាំងរូបភាព */
//   async renameResource(oldPublicId: string, newPublicId: string): Promise<any> {
//     return cloudinary.uploader.rename(oldPublicId, newPublicId);
//   }
// }

import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadCloudinaryService {
  // យើងមិនចាំបាច់ config ក្នុងនេះទៀតទេ ព្រោះយើងបានធ្វើក្នុង Provider រួចហើយ
  // ប៉ុន្តែយើងត្រូវ Inject វាចូលមក
  constructor() { }

  /** បង្ហោះរូបភាព និងត្រលប់មកវិញនូវ Format ដែលអ្នកចង់បាន */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'pos-general',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // ប្រើ cloudinary instance ដែលបានបូកបញ្ចូល config រួចជាស្រេច
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);

          resolve({
            originalFileName: file.originalname,
            fileName: `${result.public_id}.${result.format}`,
            filePath: result.folder,
            fileUrl: result.secure_url,
            fileExtension: result.format,
            fileSize: file.size,
            uploadBy: "admin",
            destinationStorage: "CLOUDINARY",
            width: result.width,
            height: result.height,
            id: result.asset_id,
            uploadType: "file-upload-type-general",
            isDeleted: false,
            uploadDate: new Date().toISOString(),
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async listResources(): Promise<any> {
    return cloudinary.api.resources({ max_results: 100 });
  }

  async getResource(publicId: string): Promise<any> {
    return cloudinary.api.resource(publicId);
  }

  async renameResource(oldPublicId: string, newPublicId: string): Promise<any> {
    return cloudinary.uploader.rename(oldPublicId, newPublicId);
  }
}