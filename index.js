const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const dayjs = require('dayjs');
dotenv.config();

const { sendToNumber, carriers } = require('./utils/notify');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_ADMIN_ID = process.env.DISCORD_ADMIN_ID;

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
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);

// discord setup ^
//         |
//
//
//
//            |
// pocketbase utils

const pb = require('./utils/pocketbase.js');

(async () => {
  await pb.admins.authWithPassword(
    process.env.API_ADMIN_EMAIL,
    process.env.API_ADMIN_PASSWORD
  );

  routine();
  setInterval(routine, 5000);
})();

async function routine() {
  const resultList = await pb.collection('notifications').getFullList({
    filter: 'datetime <= @now',
    expand: 'session,phone,session.tutee,session.tutor, session.datetime',
  });
  for (const result of resultList) {
    const { reason } = result;

    const { session } = result.expand;
    if (!session) {
      console.log(`session not found for ${result.id}`);
      await pb.collection('notifications').delete(result.id);
      continue;
    }
    const { tutee, tutor } = session.expand;
    const formattedTime = dayjs(session.datetime, 'America/Los_Angeles').format(
      'dddd, MMMM D'
    );

    const hour = dayjs(session.datetime).hour();
    const timeslot =
      hour <= 11 ? 'at TUTORIAL' : hour <= 14 ? 'DURING 7th' : 'AFTER 7th';

    const message = {
      'booking/new': `You have a new booking for ${formattedTime} ${timeslot} with ${
        result.tutee ? tutor.name : tutee ? tutee.name : 'the student'
      } @ location: ${session.location}`,
      'booking/canceled': `Your booking for ${formattedTime} has been cancelled by ${
        result.tutee ? tutor.name : tutee ? tutee.name : 'the student'
      }`,
      'reminder/5mins': `You have a tutoring session soon ${timeslot} with ${
        result.tutee ? tutor.name : tutee ? tutee.name : 'the student'
      } @ location: ${session.location}`,
      'reminder/morning': `You have a tutoring session today ${timeslot} with ${
        result.tutee ? tutor.name : tutee ? tutee.name : 'the student'
      } @ location: ${session.location}`,
    };
    const { number, carrier } = result.expand.phone;
    const text = message[reason];
    await sendToNumber(number, carrier, text);
    client.channels.cache
      .get(CHANNEL_ID)
      .send(
        `Sending... -> **${message[reason]}** -> ${number}${carriers[carrier]}`
      );
    await pb.collection('notifications').delete(result.id);
  }
}
