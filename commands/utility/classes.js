const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classes')
        .setDescription('lists all classes alphabetically by name along with id'),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        const classes = await pb.collection('classes').getFullList();
        const classNames = classes.map(classe => `${classe.teacherName} (${classe.courseName}) - (${classe.id})`).join(',\n')
        interaction.editReply(`Classes: \n${classNames}`);

    }
};