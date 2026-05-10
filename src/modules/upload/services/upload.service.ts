import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const minio = this.configService.get('minio');
    this.bucket = minio.bucketName;

    this.client = new Minio.Client({
      endPoint: minio.endpoint,
      port: minio.port,
      useSSL: minio.useSSL,
      accessKey: minio.accessKey,
      secretKey: minio.secretKey,
    });

    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) await this.client.makeBucket(this.bucket);
  }

  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<string> {
    const filename = `${folder}/${Date.now()}-${file.originalname}`;
    await this.client.putObject(this.bucket, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    return this.getPublicUrl(filename);
  }

  async deleteFile(filename: string): Promise<void> {
    await this.client.removeObject(this.bucket, filename);
  }

  private getPublicUrl(filename: string): string {
    const minio = this.configService.get('minio');
    const protocol = minio.useSSL ? 'https' : 'http';
    return `${protocol}://${minio.endpoint}:${minio.port}/${this.bucket}/${filename}`;
  }
}
