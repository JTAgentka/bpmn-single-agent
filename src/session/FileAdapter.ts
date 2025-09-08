import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileAdapterOptions {
  baseDir: string;
  encoding?: BufferEncoding;
  createDirIfNotExists?: boolean;
}

export class FileAdapter {
  private baseDir: string;
  private encoding: BufferEncoding;

  constructor(options: FileAdapterOptions) {
    this.baseDir = options.baseDir;
    this.encoding = options.encoding || 'utf8';
    
    if (options.createDirIfNotExists !== false) {
      this.ensureDirectory();
    }
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  public async write(filename: string, data: string): Promise<void> {
    const filePath = path.join(this.baseDir, filename);
    await fs.writeFile(filePath, data, this.encoding);
  }

  public async read(filename: string): Promise<string> {
    const filePath = path.join(this.baseDir, filename);
    return await fs.readFile(filePath, this.encoding);
  }

  public async exists(filename: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, filename);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async delete(filename: string): Promise<void> {
    const filePath = path.join(this.baseDir, filename);
    await fs.unlink(filePath);
  }

  public async list(pattern?: RegExp): Promise<string[]> {
    const files = await fs.readdir(this.baseDir);
    
    if (pattern) {
      return files.filter(file => pattern.test(file));
    }
    
    return files;
  }

  public async getStats(filename: string): Promise<fs.Stats> {
    const filePath = path.join(this.baseDir, filename);
    return await fs.stat(filePath);
  }

  public async createBackup(filename: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${filename}.backup.${timestamp}`;
    const sourcePath = path.join(this.baseDir, filename);
    const backupPath = path.join(this.baseDir, backupName);
    
    const data = await fs.readFile(sourcePath);
    await fs.writeFile(backupPath, data);
    
    return backupName;
  }

  public async restore(backupFilename: string, targetFilename: string): Promise<void> {
    const backupPath = path.join(this.baseDir, backupFilename);
    const targetPath = path.join(this.baseDir, targetFilename);
    
    const data = await fs.readFile(backupPath);
    await fs.writeFile(targetPath, data);
  }

  public async cleanupOldBackups(filename: string, keepCount: number = 5): Promise<number> {
    const backupPattern = new RegExp(`^${filename}\\.backup\\.`);
    const backups = await this.list(backupPattern);
    
    if (backups.length <= keepCount) {
      return 0;
    }
    
    const backupStats = await Promise.all(
      backups.map(async (backup) => ({
        name: backup,
        stats: await this.getStats(backup)
      }))
    );
    
    backupStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
    
    const toDelete = backupStats.slice(keepCount);
    
    for (const backup of toDelete) {
      await this.delete(backup.name);
    }
    
    return toDelete.length;
  }
}