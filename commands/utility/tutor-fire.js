const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tutor-fire')
    .setDescription('fires a tutor')
    .addStringOption((option) =>
      option
        .setName('tutor')
        .setDescription('the ID of the tutor to fire (e.g. 1234567890)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Removing tutor from database...',
      fetchReply: true,
    });

    const firedTutor = interaction.options.getString('tutor', true);
    try {
      const record = await pb
        .collection('tutors')
        .getFirstListItem(`id="${firedTutor}"`);
      const firedSessions = await pb.collection('sessions').getFullList({
        expand: 'tutor',
        filter: `tutor.id="${firedTutor}"`,
      });
      console.log(`Fired ${record.name}!`);
      for (const session of firedSessions) {
        await pb.collection('sessions').delete(session.id);
      }

      await pb.collection('tutors').delete(record.id);
      interaction.editReply(`Fired ${record.name}!`);
    } catch (e) {
      console.error(e);
      interaction.editReply('Problem firing tutor. Please try again.');
    }
  },
};
