import type { ObjectId } from "mongodb";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarDataUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarDataUrl: string | null;
}

export interface EncryptedPayload {
  iv: string;
  content: string;
  tag: string;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export interface VaultItemDocument {
  _id?: ObjectId;
  userId: string;
  service: string;
  website: string | null;
  username: string | null;
  passwordEncrypted: EncryptedPayload;
  noteEncrypted: EncryptedPayload | null;
  passwordStrength: PasswordStrength;
  folder: string | null;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultItemListDto {
  id: string;
  service: string;
  website: string | null;
  username: string | null;
  folder: string | null;
  favorite: boolean;
  hasNote: boolean;
  createdAt: string;
  updatedAt: string;
  passwordStrength: PasswordStrength;
}

export interface VaultItemDetailDto extends VaultItemListDto {
  password: string;
  note: string | null;
}

export interface FolderDocument {
  _id?: ObjectId;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface FolderDto {
  id: string;
  name: string;
}

export const DEFAULT_FOLDERS = [ "Work", "Personal", "Development", "Finance" ];
