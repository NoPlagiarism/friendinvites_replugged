import { Injector, Logger, common, webpack } from "replugged";
import { ApplicationCommandOptionType, FriendInvite, FriendInviteActions } from "./types";
import * as modes from './modes'
import { cfg } from "./settings";

const inject = new Injector();
const logger = Logger.plugin("xyz.noplagi.friendinvites");

const FriendInvites = webpack.getByProps<FriendInviteActions>("createFriendInvite");

export async function start(): Promise<void> {
  if (!FriendInvites) {
    logger.error("Failed to find required webpack module");
    return;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const {body: { invite_suggestions }} = await common.api.post<any>(
            {url: "/friend-finder/find-friends",
            body: {modified_contacts: {[random]: [1, "", ""]}, phone_contact_methods_count: 1}}
          );
          invite = await FriendInvites.createFriendInvite({
            code: invite_suggestions[0][3],
            recipient_phone_number_or_email: random,
            contact_visibility: 1,
            filter_visibilities: [],
            filtered_invite_suggestions_index: 1
        });
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
    executor: async (interaction) => {
      try {
        const invites = await FriendInvites.getAllFriendInvites();
        return {
          send: false,
          ...modes.getModeByID(cfg.get("mode"), modes.SimpleMessage)!.listFriendInvites(invites)
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
    executor: async (interaction) => {
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

export {SettingsWindow as Settings} from './settings'
