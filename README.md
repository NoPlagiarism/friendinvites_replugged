# Friend Invites

> Create friend invites easily in [Replugged](https://replugged.dev/).
>
> Port of [Vencord](https://vencord.dev) [plugin](https://github.com/Vendicated/Vencord/blob/main/src/plugins/friendInvites/index.ts) by [afn](https://github.com/xafn) and [Dziurwa](https://github.com/Dziurwa14).

[![Install in Replugged](https://img.shields.io/badge/-Install%20in%20Replugged-blue?style=for-the-badge&logo=none)](https://replugged.dev/install?source=store&identifier=xyz.noplagi.friendinvites)

## Commands

- `/friend-invite create`
  - Creates friend invite.
  - Options
    - `ephemeral` - if `False` sends new invite in chat.
    - ~~`uses` - `5`~~
      - ~~`1` only if phone linked to Discord account.~~
      - `1` is fully(?) disabled due [HTTP 405](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405)
- `/friend-invite list`
  - List active friend invites.
- `/friend-invite revoke`
  - Revoke all friend invites.

## Implementations in other clients

- [Vencord](https://vencord.dev/plugins/FriendInvites)
- [Vendetta](https://discord.com/channels/1015931589865246730/1093941056078364763/1093941056078364763)
- [Enmity](https://discord.com/channels/950850315601711176/961782195767365732/1036067393425903688)
- [Any browser or Discord with Developer Tools](https://github.com/woodendoors7/DiscordFriendInvites)

> Big thanks to [Replugged Team](https://github.com/replugged-org) for [Replugged](https://github.com/replugged-org/replugged) and [thewilloftheshadow](https://github.com/thewilloftheshadow) for [code example](https://github.com/thewilloftheshadow/replugged-tags)
