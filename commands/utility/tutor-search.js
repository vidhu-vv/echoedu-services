const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");
// searching functionality
dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('searches for a user by name (not case sensitive) and returns users with similar names')
        .addStringOption(option => option.setName('user').setDescription('the name to find in the db').setRequired(true)),
    async execute(interaction) {
        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }

        const user = interaction.options.getString('user');
        const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
        try {
            const users = await pb.collection('users').getFullList({
                filter: `name~"%${user}%"`,
                sort: "name",
            });
            console.log(users);
            if (users.length === 0) {
                interaction.editReply("No user found.");
                return;
            }
            interaction.editReply(`Users like "${user}": \n${users.map(user => user.name + " - (" + user.id + ")").join(',\n')}`);
        } catch (e) {
            console.error(e);
            interaction.editReply("Problem finding user. Please try again.");
        }
    }
};
