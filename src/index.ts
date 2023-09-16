import { Injector, Logger, webpack, common } from "replugged";

const inject = new Injector();
const logger = Logger.plugin("xyz.noplagi.friendinvites");

const FriendInvites = webpack.getByProps("createFriendInvite");

export function start(): Promise<void> {
  inject.utils.registerSlashCommand({
    name: "friend invite create",
    description: "Generates a friend invite link.",
    executor: async (interaction) => {
      try {
        if (!common.users.getCurrentUser().phone)
          return {
            send: false,
            result:
              "You need to have a phone number connected to your account to create a friend invite!",
          };
        const invite = await FriendInvites.createFriendInvite({
          contact_visibility: 1,
          filtered_invite_suggestions_index: 1,
          filter_visibilities: [],
        });
        return {
          send: false,
          result: `discord.gg/${invite.code} | Expires: <t:${
            new Date(invite.expires_at).getTime() / 1000
          }:R> | Max uses: \`${invite.max_uses}\``,
        };
      } catch (err) {
        logger.error(err as string);
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: "Something went wrong, please try again later",
              description: err as string,
            },
          ],
        };
      }
    },
  });

  inject.utils.registerSlashCommand({
    name: "friend invite list",
    description: "View a list of generated friend invites.",
    executor: async (interaction) => {
      try {
        const invites = await FriendInvites.getAllFriendInvites();
        const friendInvitesList = invites.map(
          (invite) =>
            `*discord.gg/${invite.code}* | Expires: <t:${new Date(
              invite.expires_at,
            ).getTime()}:R> | Times used: \`${invite.uses}/${invite.max_uses}\``,
        );
        return {
          send: false,
          result: friendInvitesList.join("\n") || "You have no active friend invites :(",
        };
      } catch (err) {
        logger.error(err as string);
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: "Something went wrong, please try again later",
              description: err as string,
            },
          ],
        };
      }
    },
  });

  inject.utils.registerSlashCommand({
    name: "friend invite revoke",
    description: "Revokes all generated friend invites.",
    executor: async (interaction) => {
      try {
        await FriendInvites.revokeFriendInvites();
        return {
          send: false,
          result: "Friend invites have been revoked.",
        };
      } catch (err) {
        logger.error(err as string);
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: "Something went wrong, please try again later",
              description: err as string,
            },
          ],
        };
      }
    },
  });
}

export function stop(): void {
  inject.uninjectAll();
}
