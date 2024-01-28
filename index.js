const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");
dotenv.config();
const eventsource = require("eventsource");
global.EventSource = eventsource;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD;

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);

// discord ^
//         |
//
//            |
// pocketbase v

let reminders = [];

const pb = new PocketBase("https://api.echo-edu.org");

pb.admins.authWithPassword(
  process.env.API_ADMIN_EMAIL,
  process.env.API_ADMIN_PASSWORD
);

pb.collection("sessions").subscribe("*", async ({ action, record }) => {
  // const result = await pb.collection("users").getOne(e.record.tutee);
  // check if a tutee was added to a session
  if (action === "update") {
    reminders.push({
      sessionid: record.id,
      location: "vidhu's basement",
      numbers: [1234567890, 9876543211],
      datetime: record.datetime,
    });
  }
});

try {
  const data = fs.readFileSync("./backups/backup.json", "utf8");
  reminders = JSON.parse(data);
  console.log("loading from backup...", reminders);
} catch {}

setInterval(async () => {
  fs.writeFileSync("./backups/backup.json", JSON.stringify(reminders), "utf8");
}, 6000);
