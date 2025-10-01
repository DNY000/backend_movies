import { User } from '../../types/user.types.js';
import { UserModel } from '../models/user.model.js'

export class UserRepository {
  async findAll(): Promise<any[]> {
    return await UserModel.find({}).lean()
  }

  async findById(id: string): Promise<any | null> {
    return await UserModel.findById(id).lean()
  }

  async create(userData: Partial<User>): Promise<any> {
    const created = await UserModel.create({
      email: userData.email,
      name: userData.name,
      username: userData.username,
      phone: (userData as any).phone,
      password: userData.password,
      avatar: userData.avatar,
      role: userData.role || 'user',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      metadata: (userData as any).metadata
    } as any)
    return created.toObject()
  }

  async update(id: string, updateData: Partial<User>): Promise<any | null> {
    return await UserModel.findByIdAndUpdate(id, updateData as any, { new: true }).lean()
  }

  async delete(id: string): Promise<boolean> {
    const res = await UserModel.deleteOne({ _id: id })
    return (res as any).deletedCount > 0
  }

  async findByEmail(email: string): Promise<any | null> {
    return await UserModel.findOne({ email }).lean()
  }

  async updateProfile(id: string, profileData: Partial<User>): Promise<any | null> {
    const allowed = { name: 1, username: 1, avatar: 1 }
    const filtered: any = {}
    for (const key of Object.keys(allowed)) {
      if ((profileData as any)[key] !== undefined) filtered[key] = (profileData as any)[key]
    }
    return await UserModel.findByIdAndUpdate(id, filtered, { new: true }).lean()
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt
    })
  }

  async findByRefreshToken(refreshToken: string): Promise<any | null> {
    return await UserModel.findOne({ refreshToken }).lean()
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 }
    })
  }
}
