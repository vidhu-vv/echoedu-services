const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-people')
    .setDescription('lists all tutors or users alphabetically by name')
    .addBooleanOption((option) =>
      option
        .setName('tutors')
        .setDescription('True: list tutors, False: list users')
        .setRequired(true)
    ),
  async execute(interaction) {
    const isTutors = interaction.options.getBoolean('tutors', true);
    await interaction.deferReply();

    if (isTutors) {
      const tutors = await pb.collection('tutors').getFullList({
        sort: 'name',
      });

      interaction.editReply(`Tutors: (${tutors.length})`);
      sendInBatches(interaction, tutors);
    } else {
      const users = await pb.collection('users').getFullList({
        sort: 'name',
      });

      interaction.editReply(`Users: (${users.length})`);
      sendInBatches(interaction, users);
    }
  },
};

const BATCH_SIZE = 35;

async function sendInBatches(interaction, array) {
  for (let i = 0; i < Math.ceil(array.length / BATCH_SIZE); i++) {
    let sendString = '';
    for (let k = 0; k < BATCH_SIZE; k++) {
      const item = array[i * BATCH_SIZE + k];
      if (item) {
        sendString += `\`${item.id}\` | ${item.name}\n`;
      }
    }
    await interaction.channel?.send(sendString);
  }
}
