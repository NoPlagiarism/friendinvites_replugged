import { Injector, Logger, common, webpack } from "replugged";
import {
  ApplicationCommandOptionType,
  FriendInvite,
  FriendInviteActions,
  HTTPResponse,
} from "./types";
import * as modes from "./modes";
import { cfg } from "./settings";

const inject = new Injector();
const logger = Logger.plugin("xyz.noplagi.friendinvites");

export async function start(): Promise<void> {
  const FriendInvites = await webpack.waitForProps<FriendInviteActions>("createFriendInvite");
  /*if (!FriendInvites) {
    logger.error("Failed to find required webpack module");
    throw Error("Failed to find required webpack module");
  }*/
  inject.utils.registerSlashCommand({
    name: "friend-invite create",
    description: "Generates a friend invite link",
    options: [
      {
        type: ApplicationCommandOptionType.Boolean,
        name: "ephemeral",
        description: "Is message shown only to you or not",
        required: false,
      },
    ],
    executor: async (interaction) => {
      try {
        const isSend = !interaction.getValue("ephemeral", true);
        let mode: modes.MessageMethod;
        if (isSend && cfg.get("alwaysSendSimple", true)) mode = modes.SimpleMessage;
        else mode = modes.getModeByID(cfg.get("mode"), modes.SimpleMessage)!;
        if (!mode.canSend && isSend) mode = modes.SimpleMessage;
        let invite: FriendInvite;
        invite = await FriendInvites.createFriendInvite();
        return {
          send: isSend,
          ...mode.createdFriendInvite(invite),
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
    name: "friend-invite list",
    description: "View a list of generated friend invites",
    executor: async (_) => {
      try {
        const invites = await FriendInvites.getAllFriendInvites();
        return {
          send: false,
          ...modes.getModeByID(cfg.get("mode"), modes.SimpleMessage)!.listFriendInvites(invites),
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
    name: "friend-invite revoke",
    description: "Revokes all generated friend invites",
    executor: async (_) => {
      try {
        await FriendInvites.revokeFriendInvites();
        return {
          send: false,
          ...modes.getModeByID(cfg.get("mode"), modes.SimpleMessage)!.revokedFriendInvites(),
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

export { SettingsWindow as Settings } from "./settings";
