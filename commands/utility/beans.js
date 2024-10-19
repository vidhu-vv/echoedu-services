const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beans')
    .setDescription("i think it's pretty self explanatory ngl"),
  async execute(interaction) {
    await interaction.reply({
      //   content: 'Pinging...',
      embeds: [
        new EmbedBuilder()
          .setTitle('beans.')
          .setImage(
            'https://www.recipetineats.com/tachyon/2014/05/Homemade-Heinz-Baked-Beans_0-SQ.jpg'
          ),
      ],
    });
  },
};
