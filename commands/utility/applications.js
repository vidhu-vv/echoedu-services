// const { SlashCommandBuilder } = require('discord.js');
// const PocketBase = require("pocketbase/cjs");
// const dotenv = require("dotenv");

// dotenv.config();

// const pb = new PocketBase("https://api.echo-edu.org");

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('applications')
//         .setDescription('lists all pending applications'),
//     async execute(interaction) {
//         if (!pb.authStore.model) {
//             await pb.admins.authWithPassword(
//               process.env.API_ADMIN_EMAIL,
//               process.env.API_ADMIN_PASSWORD
//             );
//           }
//         const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
//         const tutors = await pb.collection('applications').getFullList({
//             sort: "-created",
//             expand: "user",
//         });
//         if (tutors.length === 0) {
//             interaction.editReply("No pending applications.");
//             return;
//         }

//         interaction.editReply(`Applications: \n${tutors.map(tutor => tutor.expand.user.name + " - (" + tutor.expand.user.id + ")").join(',\n')}`);
//     }
// };