const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-classes')
    .setDescription('lists all classes alphabetically by name along with id'),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Awaiting database response...',
      fetchReply: true,
    });
    const classes = await pb.collection('classes').getFullList();
    const classNames = classes
      .map(
        (classe) =>
          `${classe.teacherName} (${classe.courseName}) - (${classe.id})`
      )
      .join(',\n');
    interaction.editReply(`Classes: \n${classNames}`);
  },
};
