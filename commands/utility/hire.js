const { SlashCommandBuilder } = require("discord.js");
const PocketBase = require("pocketbase/cjs");
const dotenv = require("dotenv");

dotenv.config();

const pb = new PocketBase("https://api.echo-edu.org");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hire")
    .setDescription("hires a tutor")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("the id of the tutor to hire (e.g. x8vs2d1w9khpu3u)")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!pb.authStore.model) {
      await pb.admins.authWithPassword(
        process.env.API_ADMIN_EMAIL,
        process.env.API_ADMIN_PASSWORD
      );
    }
    const id = interaction.options.getString("userid", true);

    const user = await pb
        .collection("users")
        .getFirstListItem(`id="${id}"`);
    if (!user) {
        await interaction.reply("User not found. Please try again.");
        return;
    }
    data = {
        "user": user.id,
        "name": user.name,
    }
    try {
      const sent = await interaction.reply({
        content: "Adding tutor to database...",
        fetchReply: true,
      });
      const record = await pb.collection("tutors").create(data);
      const applications = await pb.collection("applications").getFullList(`user="${user.id}"`);
      for (const application of applications) {
        await pb.collection("applications").delete(application.id);
      }
      interaction.editReply(`Hired ${record.name}!`);
    } catch (e) {
      console.error(e);
      interaction.editReply("Problem hiring tutor. Please try again.");
    }

  },
};