const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tutor-hire')
    .setDescription('hires a tutor')
    .addStringOption((option) =>
      option
        .setName('userid')
        .setDescription('the id of the tutor to hire (e.g. x8vs2d1w9khpu3u)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const id = interaction.options.getString('userid', true);

    const user = await pb.collection('users').getFirstListItem(`id="${id}"`);
    if (!user) {
      await interaction.reply('User not found. Please try again.');
      return;
    }

    data = {
      user: user.id,
      name: user.name,
    };

    try {
      const sent = await interaction.reply({
        content: 'Adding tutor to database...',
        fetchReply: true,
      });
      const record = await pb.collection('tutors').create(data);
      const applications = await pb
        .collection('applications')
        .getFullList(`user="${user.id}"`);
      for (const application of applications) {
        await pb.collection('applications').delete(application.id);
      }
      interaction.editReply(`Hired ${record.name}!`);
    } catch (e) {
      console.error(e);
      interaction.editReply('Problem hiring tutor. Please try again.');
    }
  },
};
