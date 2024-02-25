const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle')
        .setDescription('toggles a tutor\'s nhs status')
        .addStringOption(option => option.setName('tutorid').setDescription('the id of the tutor to toggle').setRequired(true)),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        const id = interaction.options.getString('tutorid', true);
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        try {
            const record = await pb.collection('tutors').getFirstListItem(`id="${id}"`);
            if (!record) {
                interaction.editReply("No tutors found.");
                return;
            }
            const data = {
                "user": record.user,
                "name": record.name,
                "classes": record.classes,
                "isNHS": !record.isNHS,
            }
            const updated = await pb.collection('tutors').update(id, data);            
            interaction.editReply(`Toggled the NHS status of ${record.name}. ${record.name} is now ${updated.isNHS ? "in NHS" : "not in NHS"}!`);
          } catch (e) {
            console.error(e);
            interaction.editReply("Problem toggling tutor. Please try again.");
          }

    }
};