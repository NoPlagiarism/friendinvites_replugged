import { types as DefaultTypes } from 'replugged'
import { UserJSON } from 'discord-types/general';

export interface FriendInvite {
  channel_id: null;
  code: string;
  created_at: string;
  expires_at: string;
  inviter: UserJSON;
  max_age: number;
  max_uses: 5 | 1;
  type: 2;
  uses: number;
}

export interface FriendInviteActions {
  createFriendInvite: (...args: any[]) => Promise<FriendInvite>;
  getAllFriendInvites:  () => Promise<FriendInvite[]>;
  revokeFriendInvites: DefaultTypes.AnyFunction;
}
