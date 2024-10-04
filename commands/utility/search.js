const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription(
      'searches for a user by name (not case sensitive) and returns users with similar names'
    )
    .addStringOption((option) =>
      option
        .setName('user')
        .setDescription('the name to find in the db')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getString('user');
    const sent = await interaction.reply({
      content: 'Awaiting database response...',
      fetchReply: true,
    });
    try {
      const users = await pb.collection('users').getFullList({
        filter: `name~"%${user}%"`,
        sort: 'name',
      });
      console.log(users);
      if (users.length === 0) {
        interaction.editReply('No user found.');
        return;
      }
      interaction.editReply(
        `Users like "${user}": \n${users
          .map((user) => user.name + ' - (' + user.id + ')')
          .join(',\n')}`
      );
    } catch (e) {
      console.error(e);
      interaction.editReply('Problem finding user. Please try again.');
    }
  },
};
