const { SlashCommandBuilder } = require("discord.js");
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fire")
    .setDescription("fires a tutor")
    .addStringOption((option) =>
      option
        .setName("tutor")
        .setDescription("the tutor to fire")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!pb.authStore.model) {
      await pb.admins.authWithPassword(
        process.env.API_ADMIN_EMAIL,
        process.env.API_ADMIN_PASSWORD
      );
    }

    const firedTutor = interaction.options.getString("tutor", true);
    try {
      const sent = await interaction.reply({
        content: "Removing tutor from database...",
        fetchReply: true,
      });
      const record = await pb
        .collection("tutors")
        .getFirstListItem(`name="${firedTutor}"`);
      const firedSessions = await pb
      .collection("sessions")
      .getFullList({
        expand: "tutor",
        filter: `tutor.name="${firedTutor}"`,
      });
      console.log(`Fired ${firedTutor}!`)
      for (const session of firedSessions) {
        await pb.collection("sessions").delete(session.id);
      }
      await pb.collection("tutors").delete(record.id);
      interaction.editReply(`Fired ${firedTutor}!`);
    } catch(e) {
      console.error(e);
      interaction.editReply('Problem firing tutor. Please try again.'); 
    }
  },
};
