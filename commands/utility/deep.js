const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deep')
        .setDescription('gives a deep dive into a tutor based on their tutor id')
        .addStringOption(option => option.setName('tutorid').setDescription('the id to find in the db').setRequired(true)),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }

        const tutorid = interaction.options.getString('tutorid');
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        try {
            const tutor = await pb.collection('tutors').getFirstListItem(`id="${tutorid}"`, expand="classes");
            if (!tutor) {
                interaction.editReply("No tutors found.");
                return;
            }
        async function printClass(c) {
            const record = await pb.collection('classes').getFirstListItem(`id="${c}"`);
            return `${record.teacherName}(${record.courseName})`; 
        }
        let classString = "";
        for (const c of tutor.classes) {
            classString += await printClass(c) + ", ";
        }
        const sessions = await pb.collection('sessions').getFullList(`tutor="${tutorid}"`);
        interaction.editReply(`Tutor: ${tutor.name} - (${tutor.id})\nSessions: ${sessions.length}\nIs NHS: ${tutor.nhs ? "Yes" : "No"}\nClasses: ${classString}`);
        } catch (e) {
            console.error(e);
            interaction.editReply("Problem finding tutor. Please try again.");
        }
    }
};