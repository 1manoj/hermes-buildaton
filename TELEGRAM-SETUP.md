# Telegram Channel Setup

The configured bot is **@newsXroom_bot**.

## Create and connect the channel

1. In Telegram, select **New Channel**.
2. Name it `Overnight Newsroom` and choose public or private.
3. Open the channel → channel name → **Administrators** → **Add Admin**.
4. Search for `@newsXroom_bot` and add it.
5. Enable at least **Post Messages**. Editing and deleting messages are optional.
6. Publish one ordinary message in the channel, such as `Newsroom setup`.
7. In this repository run:

```bash
npm run telegram:discover
```

The command prints a value such as:

```text
Overnight Newsroom: -1001234567890 (channel)
```

8. Put that complete negative number in `.env`:

```text
TELEGRAM_CHANNEL_ID=-1001234567890
```

9. Run `npm run integrations:check`, followed by `npm run demo`.

## Easier option for a public channel

If the channel has a public username, `TELEGRAM_CHANNEL_ID=@channel_username` also works. The numeric `-100...` ID is more stable if the username changes.

## Troubleshooting

- **No chats found:** ensure the bot is an administrator, then publish a new message after adding it.
- **403 / not enough rights:** enable **Post Messages** for the bot administrator.
- **Conflict from getUpdates:** stop any other program polling this same bot temporarily, then retry discovery.
- **Bot posts nowhere:** check `.env` contains the exact ID including the leading `-100`.
