// Antarmuka penyimpanan file privat (TECH-SPEC 7.1). Driver lokal sekarang,
// bisa diganti S3-kompatibel tanpa mengubah lapisan di atasnya.
export interface StorageDriver {
  put(key: string, bytes: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}
