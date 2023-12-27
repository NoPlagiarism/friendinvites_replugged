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

const FriendInvites = webpack.getByProps<FriendInviteActions>("createFriendInvite");

export function start(): void {
  if (!FriendInvites) {
    logger.error("Failed to find required webpack module");
    throw Error("Failed to find required webpack module");
  }
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
      {
        type: ApplicationCommandOptionType.Number,
        name: "uses",
        description: "How many uses?",
        required: false,
        choices: [
          { name: "1", displayName: "1", value: 1 },
          { name: "5", displayName: "5", value: 5 },
        ],
      },
    ],
    executor: async (interaction) => {
      try {
        const uses = interaction.getValue("uses", 5);
        if (uses == 1 && !common.users.getCurrentUser().phone)
          return {
            send: false,
            result:
              "You need to have a phone number connected to your account to create a friend invite with 1 use!",
          };
        const isSend = !interaction.getValue("ephemeral", true);
        let mode: modes.MessageMethod;
        if (isSend && cfg.get("alwaysSendSimple", true)) mode = modes.SimpleMessage;
        else mode = modes.getModeByID(cfg.get("mode"), modes.SimpleMessage)!;
        if (!mode.canSend && isSend) mode = modes.SimpleMessage;
        let invite: FriendInvite;
        if (uses == 5) invite = await FriendInvites.createFriendInvite();
        else {
          const random = crypto.randomUUID();
          // Yeah, no more ideas, I can't do TypeScript magic here.
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: HTTPResponse<Record<string, any>> = await common.api.post<any>({
              url: "/friend-finder/find-friends",
              body: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                modified_contacts: { [random]: [1, "", ""] },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                phone_contact_methods_count: 1,
              },
            });
            const {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              body: { invite_suggestions },
            } = response;
            invite = await FriendInvites.createFriendInvite({
              code: invite_suggestions[0][3],
              // eslint-disable-next-line @typescript-eslint/naming-convention
              recipient_phone_number_or_email: random,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              contact_visibility: 1,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              filter_visibilities: [],
              // eslint-disable-next-line @typescript-eslint/naming-convention
              filtered_invite_suggestions_index: 1,
            });
          } catch (_) {
            logger.error(`Got error while friend-finder/find-friends`);
            return { send: false, result: "Got some error. Try again later or choose 5 uses" };
          }
        }
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
