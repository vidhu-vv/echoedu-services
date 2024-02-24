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
        .setName("name")
        .setDescription("the name of the tutor to hire (e.g. Alexander Bonev)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("grade")
        .setDescription("the grade of the tutor to hire (e.g. 11)")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("isnhs")
        .setDescription("Is the tutor in NHS (true/false)")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!pb.authStore.model) {
      await pb.admins.authWithPassword(
        process.env.API_ADMIN_EMAIL,
        process.env.API_ADMIN_PASSWORD
      );
    }
    const name = interaction.options.getString("name", true);
    const grade = interaction.options.getInteger("grade", true);
    const isnhs = interaction.options.getBoolean("isnhs", true);

    const user = await pb
        .collection("users")
        .getFirstListItem(`name="${name}"`);
    if (!user) {
        await interaction.reply("User not found. Please try again.");
        return;
    }
    data = {
        "user": user.id,
        "name": name,
        "grade": grade,
        "isnhs": isnhs,
    }
    try {
      const sent = await interaction.reply({
        content: "Adding tutor to database...",
        fetchReply: true,
      });
      const record = await pb.collection("tutors").create(data);
      interaction.editReply(`Hired ${record.name}!`);
    } catch (e) {
      console.error(e);
      interaction.editReply("Problem hiring tutor. Please try again.");
    }

  },
};