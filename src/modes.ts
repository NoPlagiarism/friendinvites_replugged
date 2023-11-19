import { DefaultTypes, FriendInvite } from "./types";

export interface MessageMethod {
  canSend: boolean;
  stringId: string;
  createdFriendInvite: (invite: FriendInvite) => DefaultTypes.RepluggedCommandResult;
  listFriendInvites: (invites: FriendInvite[]) => DefaultTypes.RepluggedCommandResult;
  revokedFriendInvites: () => DefaultTypes.RepluggedCommandResult;
}

export const SimpleMessage: MessageMethod = {
  canSend: true,
  stringId: "simple",
  createdFriendInvite(invite) {
    return {
      result: `discord.gg/${invite.code} | Expires: <t:${
        new Date(invite.expires_at).getTime() / 1000
      }:R> | Max uses: \`${invite.max_uses}\``,
    };
  },
  listFriendInvites(invites) {
    const friendInvitesList = invites.map(
      (invite) =>
        `- *discord.gg/${invite.code}* | Expires: <t:${
          new Date(invite.expires_at).getTime() / 1000
        }:R> | Times used: \`${invite.uses}/${invite.max_uses}\``,
    );
    return {
      result: friendInvitesList.join("\n") || "You have no active friend invites :(",
    };
  },
  revokedFriendInvites() {
    return {
      result: "Friend invites have been revoked.",
    };
  },
};

export const EscapedMessage: MessageMethod = {
  canSend: true,
  stringId: "escaped",
  createdFriendInvite(invite) {
    return {
      result: `\`discord.gg/${invite.code}\` | Expires: <t:${
        new Date(invite.expires_at).getTime() / 1000
      }:R> | Max uses: \`${invite.max_uses}\``,
    };
  },
  listFriendInvites(invites) {
    const friendInvitesList = invites.map(
      (invite) =>
        `- *\`discord.gg/${invite.code}\`* | Expires: <t:${
          new Date(invite.expires_at).getTime() / 1000
        }:R> | Times used: \`${invite.uses}/${invite.max_uses}\``,
    );
    return {
      result: friendInvitesList.join("\n") || "You have no active friend invites :(",
    };
  },
  revokedFriendInvites() {
    return {
      result: "Friend invites have been revoked.",
    };
  },
};

export let modes = [SimpleMessage, EscapedMessage];

export function getModeByID(
  modeID: string,
  fallback?: MessageMethod,
): MessageMethod | null | undefined {
  for (let mode of modes) {
    if (mode.stringId == modeID) return mode;
  }
  if (fallback) return fallback;
}
