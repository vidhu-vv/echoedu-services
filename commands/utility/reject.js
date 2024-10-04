// const { SlashCommandBuilder } = require('discord.js');
// const PocketBase = require("pocketbase/cjs");
// const dotenv = require("dotenv");

// dotenv.config();

// const pb = new PocketBase("https://api.echo-edu.org");

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('reject')
//         .setDescription('rejects a specific tutor application based on the user id')
//         .addStringOption(option => option.setName('userid').setDescription('the id of the tutor to reject').setRequired(true)),
//     async execute(interaction) {
//         if (!pb.authStore.model) {
//             await pb.admins.authWithPassword(
//               process.env.API_ADMIN_EMAIL,
//               process.env.API_ADMIN_PASSWORD
//             );
//           }
//         const id = interaction.options.getString('userid', true);
//         const sent = await interaction.reply({content: 'Awaiting database response...', fetchReply: true});
//         try {
//             const records = await pb.collection('applications').getFullList(`user="${id}"`, {
//                 expand: "user",
//             });
//             if (records.length === 0) {
//                 interaction.editReply("No pending applications for that user.");
//                 return;
//             }
//             for(const record of records) {
//                 await pb.collection('applications').delete(record.id);
//             }
//             const user = await pb.collection('users').getFirstListItem(`id="${id}"`);
//             interaction.editReply(`Rejected ${records.length} application${records.length === 1 ? "" : "s"} from ${user.name} - (${user.id})!`);
//           } catch (e) {
//             console.error(e);
//             interaction.editReply("Problem rejecting application. Please try again.");
//           }

//     }
// };