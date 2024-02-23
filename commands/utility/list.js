const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('lists all tutors'),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        const tutors = await pb.collection('tutors').getFullList();
        const tutorNames = tutors.map(tutor => tutor.name);
        interaction.editReply(`Tutors: \n${tutorNames.join(',\n')}`);
    }
};