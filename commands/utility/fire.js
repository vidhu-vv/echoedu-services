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
    console.log(firedTutor)

    try {
      const record = await pb
        .collection("tutors")
        .getFirstListItem({ filter: `name = "${firedTutor}"` });
      console.log(record.grade);
      const sent = await interaction.reply({
        content: "Removing tutor from database...",
        fetchReply: true,
      });
      await pb.collection("tutors").delete(record.id);
      interaction.editReply(`Fired ${tutor}!`);
    } catch {
      const sent = await interaction.reply({
        content: "Tutor not found",
        fetchReply: true,
      });
    }
  },
};
