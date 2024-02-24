const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('searches for a tutor by name (not case sensitive) and returns tutors with similar names')
        .addStringOption(option => option.setName('tutor').setDescription('the name to find in the db').setRequired(true)),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        const tutor = interaction.options.getString('tutor');
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        const tutors = await pb.collection('tutors').getFullList({
            filter: `name?~"%${tutor}%"`,
            sort: "name"
        });
        interaction.editReply(`Tutors like "${tutor}": \n${tutors.map(tutor => tutor.name + " - (" + tutor.id + ")").join(',\n')}`);
    }
};