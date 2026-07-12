import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_extension' })
  fileExtension: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'upload_by', nullable: true })
  uploadBy: string;

  @Column({ name: 'upload_type', default: 'file-upload-type-general' })
  uploadType: string;

  @Column({ name: 'destination_storage', default: 'MINIO' })
  destinationStorage: string;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'group_id', nullable: true })
  groupID: string;

  @Column({ name: 'public_id', nullable: true })
  publicId: string;

  @CreateDateColumn({ name: 'upload_date' })
  uploadDate: Date;
}
