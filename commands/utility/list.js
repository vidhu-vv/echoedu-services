const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('lists all tutors or users alphabetically by name')
        .addBooleanOption((option) =>
          option
            .setName("tutors")
            .setDescription("True: list tutors, False: list users")
            .setRequired(true)
        ),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        const isTutors = interaction.options.getBoolean("tutors", true);
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        const tutors = await pb.collection('tutors').getFullList({
            sort: "name"
        });
        const users = await pb.collection('users').getFullList({
            sort: "name"
        });
        const tutorNames = tutors.map(tutor => tutor.name + " - (" + tutor.id + ")").join(',\n')
        if(!isTutors) {
            interaction.editReply(`Users: \n${users.map(user => user.name).join(',\n')}`);
            return;
        }
        else {
          interaction.editReply(`Tutors: \n${tutorNames}`);
          return;
        }
    }
};